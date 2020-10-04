const argv = require('process').argv;
const webdriver = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const chromedriver = require('chromedriver');
const http = require('http');
const url = require('url');
chrome.setDefaultService(new chrome.ServiceBuilder(chromedriver.path).build());
const By = webdriver.By;

const debug = true;

//const zoneId = argv[2];
const zoneId = 13224;
const SPELL_DUMP = [];
const urlToNPCName = {};



const seleniumDriver = new webdriver.Builder()
    .withCapabilities(webdriver.Capabilities.chrome())
    .build();

const baseUrl = `https://shadowlands.wowhead.com/zone=13224/castle-nathria#npcs`;
seleniumDriver.get(baseUrl);

seleniumDriver.findElements(By.xpath("//*[@id='tab-npcs']/div[2]/div/table/tbody/tr[@class='listview-row']/td[@class='icon-boss-padded']/a[@class='listview-cleartext']")).then((elements) => {
    elements.forEach((element) => {
         const textPromise = element.getText();
         const hrefPromise = element.getAttribute('href');
         Promise.all([textPromise, hrefPromise]).then((values) => {
            const elementText = values[0];
            const elementHref = values[1];
            const rfJournalLink = `${elementHref}/raid-finder-encounter-journal`;
            const nJournalLink = `${elementHref}/normal-encounter-journal`;
            const hJournalLink = `${elementHref}/heroic-encounter-journal`;
            const mJournalLink = `${elementHref}/mythic-encounter-journal`;
            const journalLinks = [rfJournalLink, nJournalLink, hJournalLink, mJournalLink];
            journalLinks.forEach((journal) => {
                seleniumDriver.get(journal).then((journalPage) => {
                    debug && console.log(`Opened journal page ${journal}`);
                    seleniumDriver.findElements(By.xpath("//a")).then((journalElements) => {
                        journalElements.forEach((journalElement) => {
                            journalElement.getAttribute('href').then((journalHref) => {
                                if (journalHref !== null && journalHref.includes("spell=")) {
                                    seleniumDriver.get(journalHref).then((spellPage) => {
                                        const headerPromise = seleniumDriver.findElement(By.xpath("//ha[@class='heading-size-1']")).then((headerElement) => {
                                            return headerElement.getText();
                                        });
                                        const iconPromise = seleniumDriver.findElement(By.xpath("//*[@id='infobox-contents-0']/ul/li[2]/div/a")).then((iconElement) => {
                                            return iconElement.getText();
                                        });
                                        const spellIdRegex = new RegExp('\/spell=(\d+)\/');
                                        const spellNameRegex = new RegExp('\/spell=(?:\d+)\/([a-zA-Z0-9\-]+)');
                                        const spellIdArr = spellIdRegex.exec(journalHref);
                                        const spellNameArr = spellNameRegex.exec(journalHref);
                                        debug && console.log(`SpellID regex match: ${spellIdArr}.`);
                                        debug && console.log(`SpellName regex match: ${spellNameArr}.`);
                                        Promise.all([headerPromise, iconPromise]).then((spellValues) => {
                                            debug && console.log(`Spell values: ${spellValues}.`);
                                        });
                                    });
                                }
                            });
                        });
                    });
                }).catch((err) => {
                    debug && console.log(err);
                });
            });
         });
    });
});
