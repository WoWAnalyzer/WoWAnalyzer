const argv = require('process').argv;
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const By = webdriver.By;

const debug = true;

const RAID_FINDER_KEY = "raidFinder";
const NORMAL_KEY = "normal";
const HEROIC_KEY = "heroic";
const MYTHIC_KEY = "mythic";

//const zoneId = argv[2];
//const zoneName = argv[3];

const seleniumDriver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

const baseUrl = `https://shadowlands.wowhead.com/zone=13224/castle-nathria#npcs`;
seleniumDriver.get(baseUrl);

async function getNPCPages(driver) {
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
        debug && console.log(err);
        return {};
    }
}

function getDungeonJournalPagesPerNPC(npcNameToUrl) {
    const npcToDungeonJournals = {};
    Object.keys(npcNameToUrl).forEach((npcName) => {
        npcToDungeonJournals[npcName] = {};
        npcToDungeonJournals[npcName][RAID_FINDER_KEY] = `${npcNameToUrl[npcName]}/raid-finder-encounter-journal`;
        npcToDungeonJournals[npcName][NORMAL_KEY] = `${npcNameToUrl[npcName]}/normal-encounter-journal`;
        npcToDungeonJournals[npcName][HEROIC_KEY] = `${npcNameToUrl[npcName]}/heroic-encounter-journal`;
        npcToDungeonJournals[npcName][MYTHIC_KEY] = `${npcNameToUrl[npcName]}/mythic-encounter-journal`;
    });
    console.log(JSON.stringify(npcToDungeonJournals, null, 2));
    return npcToDungeonJournals;
}

async function getSpellURLsOnPage(driver, page) {
    driver.get(page);
    const linkElements = await driver.findElements(By.xpath("//a"));
    const linkHrefs = await Promise.all(linkElements.map((element) => element.getAttribute("href")));
    const spellHrefs = linkHrefs.filter((href) => href !== null && href.includes("spell="));
    return spellHrefs;
}

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

async function getSpellObjFromSpellPage(driver, spellPageUrl) {
    driver.get(spellPageUrl);
    const header = await driver.findElement(By.xpath("//ha[@class='heading-size-1']")).then((headerElement) => {
        return headerElement.getText();
    });

    const icon = await driver.findElement(By.xpath("//*[@id='infobox-contents-0']/ul/li[2]/div/a")).then((iconElement) => {
        return iconElement.getText();
    });
    const idRegex = /spell=(\d+)/;
    const idRegexArr = idRegex.exec(spellPageUrl);
    let id = null;
    if (idRegexArr.length > 2) {
        id = idRegexArr[1];
    }
    return {
        id: id,
        name: header,
        icon: icon,
    };
}

// Sourced from https://stackoverflow.com/questions/40195766/lowercase-all-letters-in-a-string-except-the-first-letter-and-capitalize-first-l
function lowerCaseAllWordsExceptFirstLetters(string) {
    return string.replace(/\S*/g, function (word) {
        return word.charAt(0) + word.slice(1).toLowerCase();
    });
}

getNPCPages(seleniumDriver).then((npcToUrlMap) => {
    const dungeonJournalMap = getDungeonJournalPagesPerNPC(npcToUrlMap);
    getSpellURLsPerNPCPerDifficulty(seleniumDriver, dungeonJournalMap).then((spellsPerDifficultyPerNpc) => {

    });
});


