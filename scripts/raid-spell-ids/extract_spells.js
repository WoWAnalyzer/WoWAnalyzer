// This is a script to extract all spell data associated with a given zone/raid. Much easier than gathering all the data manually.
// It requires chromedriver to be present on your local PATH and takes a very long time to run with the retry strategy (20+ minutes).
// This should only need to be run once per patch once a raid has been released.
// Usage: node extract_spells.js [zoneURL] [outputFile]

const argv = require('process').argv;
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const fs = require('fs');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const By = webdriver.By;

const debug = false;

const RAID_FINDER_KEY = "raidFinder";
const NORMAL_KEY = "normal";
const HEROIC_KEY = "heroic";
const MYTHIC_KEY = "mythic";
const NUM_RETRIES = 10;

// Retrieve all boss-level NPC wowhead page URLs from a zone URL. Returns an object where NPC names are keys with the given URL string as a value.
async function getNPCPages(driver, zoneUrl) {
    driver.get(zoneUrl);
    for (let i = 0; i < NUM_RETRIES; i++) {
        try {
            const npcElements = await driver.findElements(By.xpath("//*[@id='tab-npcs']/div[2]/div/table/tbody/tr[@class='listview-row']/td[@class='icon-boss-padded']/a[@class='listview-cleartext']"));
            const npcNames = await Promise.all(npcElements.map((element) => element.getText()));
            const npcHrefs = await Promise.all(npcElements.map((element) => element.getAttribute("href")));
            const modifiedNpcNames = npcNames.map((npc) => npc.toLowerCase().replace(" ", "-").replace("'", ""));
            debug && console.log(`NPC modified names: ${modifiedNpcNames}`);
            const npcNameToUrlMap = {};
            modifiedNpcNames.forEach((npc, i) => {
                npcNameToUrlMap[npc] = npcHrefs[i];
            });
            return npcNameToUrlMap;
        } catch (err) {
            debug && console.log(`getNPCPages retry ${i} for zone URL ${zoneUrl}. Err: ${err.message}`);
            if (i >= NUM_RETRIES) {
                throw err;
            }
        }
    }
    
}

// Retrieves all dungeon journal wowhead page URLs for each of the NPCs in the provided object. Argument npcNameToUrl is an object with NPC names as keys and the URL
// for their zone page as the values.
function getDungeonJournalPagesPerNPC(npcNameToUrl) {
    const npcToDungeonJournals = {};
    Object.keys(npcNameToUrl).forEach((npcName) => {
        npcToDungeonJournals[npcName] = {};
        npcToDungeonJournals[npcName][RAID_FINDER_KEY] = `${npcNameToUrl[npcName]}/raid-finder-encounter-journal`;
        npcToDungeonJournals[npcName][NORMAL_KEY] = `${npcNameToUrl[npcName]}/normal-encounter-journal`;
        npcToDungeonJournals[npcName][HEROIC_KEY] = `${npcNameToUrl[npcName]}/heroic-encounter-journal`;
        npcToDungeonJournals[npcName][MYTHIC_KEY] = `${npcNameToUrl[npcName]}/mythic-encounter-journal`;
    });
    debug && console.log(JSON.stringify(npcToDungeonJournals, null, 2));
    return npcToDungeonJournals;
}

// Deduplicates spell URLs according to spell ID.
function dedupeHrefs(spellHrefs) {
    const idRegex = /spell=(\d+)/;
    const returnHrefs = [];
    const usedIds = new Set();
    spellHrefs.forEach((spellHref) => {
        const spellId = idRegex.exec(spellHref)[1];
        if (!usedIds.has(spellId) && spellId !== undefined) {
            returnHrefs.push(spellHref);
            usedIds.add(spellId);
        }
    });
    debug && console.log(`Deduped hrefs: ${returnHrefs}`);
    return returnHrefs;
}

// Retrieves all unique URLs pointing to a wowhead spell page from the given dungeon journal page.
// Retrieves only URLs referenced within the dungeon journal itself, not additional comments or other areas.
async function getSpellURLsOnPage(driver, page) {
    driver.get(page);
    for (let i = 0; i < NUM_RETRIES; i++) {
        try {
            const linkElements = await driver.findElements(By.xpath("//div[@id='ej-text']//a[contains(@href, 'spell=')]"));
            const linkHrefs = await Promise.all(linkElements.map((element) => element.getAttribute("href")));
            const spellHrefs = linkHrefs.filter((href) => href !== null && href.includes("spell="));
            const dedupedHrefs = dedupeHrefs(spellHrefs);
            debug && console.log(`Deduped hrefs for page ${page}: ${dedupedHrefs}`);
            return dedupedHrefs;
        } catch (err) {
            debug && console.log(`getSpellURLsOnPage for page ${page} retry ${i}. Err: ${err.message}`);
            if (i >= NUM_RETRIES) {
                throw err;
            }
        }
    }
    
}

// Create an object containing each NPC name to each difficulty to each spell URL associated with that fight.
//Argument npcToDungeonJournal is an object mapping from NPC name to difficulty to dungeon journal URL for that fight.
async function getSpellURLsPerNPCPerDifficulty(driver, npcToDungeonJournal) {
    const npcs = Object.keys(npcToDungeonJournal);
    const spellUrlsPerNpcPerDifficulty = {};
    for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        const raidFinderSpells = await getSpellURLsOnPage(driver, npcToDungeonJournal[npc][RAID_FINDER_KEY]);
        const normalSpells = await getSpellURLsOnPage(driver, npcToDungeonJournal[npc][NORMAL_KEY]);
        const heroicSpells = await getSpellURLsOnPage(driver, npcToDungeonJournal[npc][HEROIC_KEY]);
        const mythicSpells = await getSpellURLsOnPage(driver, npcToDungeonJournal[npc][MYTHIC_KEY]);
        spellUrlsPerNpcPerDifficulty[npc] = {};
        spellUrlsPerNpcPerDifficulty[npc][RAID_FINDER_KEY] = raidFinderSpells;
        spellUrlsPerNpcPerDifficulty[npc][NORMAL_KEY] = normalSpells;
        spellUrlsPerNpcPerDifficulty[npc][HEROIC_KEY] = heroicSpells;
        spellUrlsPerNpcPerDifficulty[npc][MYTHIC_KEY] = mythicSpells;
    }
    return spellUrlsPerNpcPerDifficulty;
}

// Given a URL to a wowhead spell page, creates a WowAnalyzer spell object that describes the contents of that spell page.
async function getSpellObjFromSpellPage(driver, spellPageUrl) {
    driver.get(spellPageUrl);
    for (let i = 0; i < NUM_RETRIES; i++) {
        try {
            const header = await driver.findElement(By.xpath("//h1[@class='heading-size-1']")).then((headerElement) => {
                return headerElement.getText();
            });
        
            const icon = await driver.findElement(By.xpath("//*[@id='infobox-contents-0']/ul/li[2]/div/a")).then((iconElement) => {
                return iconElement.getText();
            });
            const idRegex = /spell=(\d+)/;
            const idRegexArr = idRegex.exec(spellPageUrl);
            let spellId = null;
            if (idRegexArr.length > 1) {
                spellId = idRegexArr[1];
            }
            return {
                id: spellId,
                name: header,
                icon: icon,
            };
        } catch (err) {
            debug && console.log(`getSpellObjFromSpellPage for page ${spellPageUrl} retry ${i}. Err: ${err.message}`);
            if (i >= NUM_RETRIES) {
                throw err;
            }
        }
    } 
    
}

// Retrieve all spell objects from the given list of wowhead spell URLs.
async function getAllSpellObjsForDifficulty(driver, spellUrls) {
    const spellObjs = [];
    for (let i = 0; i < spellUrls.length; i++) {
        const spellObj = await getSpellObjFromSpellPage(driver, spellUrls[i]);
        spellObjs.push(spellObj);
    }
    return spellObjs;
}

// Retrieve all spell objects for a given zone. Argument spellsPerDifficultyPerNpc is an object
// that maps from npc name to diffculty to an array of spell URLs associated with that fight.
async function getAllSpellObjsForZone(driver, spellsPerDifficultyPerNpc) {
    const npcs = Object.keys(spellsPerDifficultyPerNpc);
    let spellObjs = {};
    for (let i = 0; i < npcs.length; i++) {
        const npc = npcs[i];
        const raidFinderSpells = await getAllSpellObjsForDifficulty(driver, spellsPerDifficultyPerNpc[npc][RAID_FINDER_KEY]);
        const normalSpells = await getAllSpellObjsForDifficulty(driver, spellsPerDifficultyPerNpc[npc][NORMAL_KEY]);
        const heroicSpells = await getAllSpellObjsForDifficulty(driver, spellsPerDifficultyPerNpc[npc][HEROIC_KEY]);
        const mythicSpells = await getAllSpellObjsForDifficulty(driver, spellsPerDifficultyPerNpc[npc][MYTHIC_KEY]);
        const formattedRaidFinderSpells = formatSpellObjs(npc, RAID_FINDER_KEY, filterArray(raidFinderSpells));
        const formattedNormalSpells = formatSpellObjs(npc, NORMAL_KEY, filterArray(normalSpells));
        const formattedHeroicSpells = formatSpellObjs(npc, HEROIC_KEY, filterArray(heroicSpells));
        const formattedMythicSpells = formatSpellObjs(npc, MYTHIC_KEY, filterArray(mythicSpells));
        spellObjs = Object.assign(spellObjs, formattedRaidFinderSpells, formattedNormalSpells, formattedHeroicSpells, formattedMythicSpells);
    }
    debug && console.log(`Zone spell objs: ${JSON.stringify(spellObjs, null, 2)}`);
    return spellObjs;
}

// Filter out null and undefined values from an array.
function filterArray(arr) {
    return arr.filter((ele) => ele !== null && ele !== undefined);
}

// Format an array of spell objects into a single object with appropriate key names for encounters.js
function formatSpellObjs(npcName, difficultyKey, spellObjs) {
    const formattedObjs = {};
    const formattedName = npcName.toUpperCase().replace("-", "_");
    const formattedKey = difficultyKey.toUpperCase();
    const keyNameCount = {};
    spellObjs.forEach((spellObj) => {
        const formattedSpellName = spellObj.name.toUpperCase().replace(" ", "_");
        let keyName = [formattedName, formattedKey, formattedSpellName].join("_");
        if (keyNameCount[keyName] !== undefined) {
            keyNameCount[keyName] += 1;
            keyName = keyName + `_${keyNameCount[keyName]}`;
        } else {
            keyNameCount[keyName] = 0;
        }
        formattedObjs[keyName] = spellObj;
    });

    return formattedObjs;
}

const zoneUrl = argv[2];
const outputFile = argv[3];
const seleniumDriver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();
getNPCPages(seleniumDriver, zoneUrl).then((npcToUrlMap) => {
    const dungeonJournalMap = getDungeonJournalPagesPerNPC(npcToUrlMap);
    getSpellURLsPerNPCPerDifficulty(seleniumDriver, dungeonJournalMap).then((spellsPerDifficultyPerNpc) => {
        getAllSpellObjsForZone(seleniumDriver, spellsPerDifficultyPerNpc).then((outputObj) => {
            const stringifiedOutput = JSON.stringify(outputObj, null, 2);
            if (outputFile == undefined || outputFile == null) {
                console.log(stringifiedOutput);
            } else {
                fs.writeFile(outputFile, stringifiedOutput, (err) => {
                    if(err) {
                        console.log(`Error in writing to file: ${err.message}`);
                    }
                    
                });
            }
        });
    });
});


