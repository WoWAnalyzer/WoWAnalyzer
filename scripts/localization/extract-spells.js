'use strict';

// region setup

// Makes the script crash on unhandled rejections instead of silently
// ignoring them. In the future, promise rejections that are not handled will
// terminate the Node.js process with a non-zero exit code.
process.on('unhandledRejection', err => {
  throw err;
});

const fs = require('fs');
const path = require('path');
const request = require('request-promise-native');
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
const NODE_ENV = process.env.NODE_ENV;

console.log('Extracting spell names...');

const appDirectory = fs.realpathSync(process.cwd());
const locaizationDirectory = path.resolve(appDirectory, 'src', 'Localization');

// region .env
// Source: https://github.com/facebook/create-react-app
const dotenvPath = path.resolve(appDirectory, '.env');

// https://github.com/bkeepers/dotenv#what-other-env-files-can-i-use
const dotenvFiles = [
  `${dotenvPath}.${NODE_ENV}.local`,
  `${dotenvPath}.${NODE_ENV}`,
  // Don't include `.env.local` for `test` environment
  // since normally you expect tests to produce the same
  // results for everyone
  NODE_ENV !== 'test' && `${dotenvPath}.local`,
  dotenvPath,
].filter(Boolean);

// Load environment variables from .env* files. Suppress warnings using silent
// if this file is missing. dotenv will never modify any environment variables
// that have already been set.
// https://github.com/motdotla/dotenv
dotenvFiles.forEach(dotenvFile => {
  if (fs.existsSync(dotenvFile)) {
    require('dotenv').config({
      path: dotenvFile,
    });
  }
});
// endregion

// endregion

// By default only missing spells are updated. If this is set to true everything will be refreshed. Useful after patches.
const updateEverything = false;

const languages = require(path.resolve(appDirectory, 'src/common/languages')).default;
const SPELLS = require(path.resolve(appDirectory, 'src/common/SPELLS')).default;
// SPELLS gets enhanced but that introduces some duplication, so group everything by spell id
const spellIds = Object.keys(SPELLS)
  .map(key => SPELLS[key])
  .reduce((ids, spell) => {
    ids.push(spell.id);
    return ids;
  }, []);

async function fetchSpellInfo(spellId, language) {
  let spellInfo = null;
  let tries = 0;
  while (!spellInfo) {
    try {
      // eslint-disable-next-line no-await-in-loop
      spellInfo = await request.get({
        url: `https://${language.region}.api.battle.net/wow/spell/${spellId}?locale=${language.locale}&apikey=${process.env.REACT_APP_BATTLE_NET_API_KEY}`,
        headers: {
          'User-Agent': 'WoWAnalyzer.com development script',
        },
        gzip: true,
        forever: true, // we'll be making several requests, so pool connections
      })
        .then(jsonString => JSON.parse(jsonString));
    } catch (err) {
      console.error(err.message);
    }

    tries += 1;
    if (tries > 5) {
      throw new Error(`Unable to fetch spell info for spell ${spellId}.`);
    }
  }
  return spellInfo;
}
function readJson(path) {
  return JSON.parse(fs.readFileSync(path, 'utf8'));
}
function formatPercentage(percentage) {
  return `${Math.floor(percentage * 100)}%`;
}
function createMessageId(spellId) {
  const spell = SPELLS[spellId];
  // Use brackets to differentiate from regular strings
  return `[${spell.name}]`;
}
function getMessagesPath(languageCode) {
  const languageDirectory = path.resolve(locaizationDirectory, languageCode);
  return path.resolve(languageDirectory, 'messages.json');
}
function getMessages(languageCode) {
  return readJson(getMessagesPath(languageCode));
}
function setMessages(languageCode, messages) {
  fs.writeFileSync(
    getMessagesPath(languageCode),
    JSON.stringify(messages, null, 2)
  );
}
async function updateSpellsFromApi(languageCode, language) {
  console.log(`Updating spells for ${languageCode} from Blizzard API`);

  const messages = getMessages(languageCode);

  const numSpells = spellIds.length;
  for (let i = 0; i < numSpells; i += 1) {
    const spellId = spellIds[i];
    const messageId = createMessageId(spellId);
    if (!updateEverything && messages[messageId]) {
      // Already localized
      continue;
    }

    const spell = SPELLS[spellId];
    console.log(`${languageCode} ${formatPercentage((i + 1) / numSpells)}: Updating ${spellId} (${spell.name})...`);
    if (spellId < 0) {
      // Spell with ids < 0 do not exist in-game. Use the coder's name instead.
      messages[messageId] = spell.name;
    } else {
      // eslint-disable-next-line no-await-in-loop
      const spellInfo = await fetchSpellInfo(spellId, language);

      // Some spells aren't localized, use the original name instead.
      const name = spellInfo.name !== '' ? spellInfo.name : spell.name;

      messages[messageId] = name;
    }

    // Update on every change since the bottleneck will be network requests instead of filesystem anyway, and this reduces the loss of data upon error
    setMessages(languageCode, messages);
  }
}
function updateFromSpellList(languageCode, nameProp) {
  console.log(`Updating spells for ${languageCode} from spell list`);

  const messages = getMessages(languageCode);
  // Download from https://www.warcraftlogs.com/json/spell-names.json
  const spellList = require('./spell-names.json');

  const numSpells = spellIds.length;
  for (let i = 0; i < numSpells; i += 1) {
    const spellId = spellIds[i];
    const messageId = createMessageId(spellId);
    if (!updateEverything && messages[messageId]) {
      // Already localized
      continue;
    }

    const spell = SPELLS[spellId];
    console.log(`${languageCode} ${formatPercentage((i + 1) / numSpells)}: Updating ${spellId} (${spell.name})...`);
    if (spellId < 0) {
      // Spell with ids < 0 do not exist in-game. Use the coder's name instead.
      messages[messageId] = spell.name;
    } else {
      const spellIdString = spellId.toString();
      const spellInfo = spellList.find(item => item.id === spellIdString);

      // Some spells aren't localized, use the original name instead.
      const name = (spellInfo && spellInfo[nameProp]) ? spellInfo[nameProp] : spell.name;

      messages[messageId] = name;
    }
  }

  // Update just once or this will be the bottleneck
  setMessages(languageCode, messages);
}

async function main() {
  // We could decide to split this up at some point; https://us.battle.net/forums/en/bnet/topic/20765127617#2
  console.log(`Using Battle.net API key: ${process.env.REACT_APP_BATTLE_NET_API_KEY}`);
  const languageCodes = Object.keys(languages);
  for (let i = 0; i < languageCodes.length; i += 1) {
    const languageCode = languageCodes[i];
    const language = languages[languageCode];
    if (language.region) {
      // We're doing all languages at the same time, this improves performance and the Blizzard API support 100 requests per second so shouldn't hit the rate limit
      updateSpellsFromApi(languageCode, language);
    } else {
      console.warn(`${languageCode} has no API available.`);
      if (languageCode === 'zh') {
        console.log('Falling back to WCL spell list data.');
        updateFromSpellList(languageCode, 'name_zhcn');
      }
    }
  }
}
main();
