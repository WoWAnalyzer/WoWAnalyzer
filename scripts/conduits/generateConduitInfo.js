const fs = require('fs');

let jsSpellOutput = '';
let jsSpellScalingOutput = '';
let fullOutput =
  `\t"CONDUIT_NAME": {
\t\t"id": "The spell ID of the conduit -- This is what should be used when identifying if a player has that conduit and also for searching for it on WoWHead or similiar.",
\t\t"name": "The name of the conduit",
\t\t"icon": "The icon string of the conduit",
\t\t"type": "The type of the conduit - potency, endurance, finesse",
\t\t"covenantID": "The ID of the covenant, as defined in src/game/shadowlands/COVENANTS.ts",
\t\t"soulbindConduitID": "The unique ID of that conduit that is the same regardless of the rank",
\t\t"conduitItemID": "The item ID of the item giving you access to the conduit. Used when searching wowhead with item= searches",
\t\t"spellModifierByRanks": {
\t\t\t"rankInteger": "The effect it has on the spell it affects, the value can be in milliseconds, percentage numbers etc - that's up to the maintainer to figure out. Note rank 1 is index 0 - this is also the case in the game data."
\t\t}
  },\n`;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

//Generated from https://wow.tools/dbc/?dbc=soulbindconduititem
const conduitItemInfo = readJson('./data/soulbindconduititem.json');
//Generated from https://wow.tools/dbc/?dbc=soulbindconduitrank
const conduitRankInfo = readJson('./data/soulbindconduitrank.json');
//Taken from https://www.raidbots.com/static/data/live/conduits.json
const conduitRaidbots = readJson('./data/raidbotsConduitsInfo.json');

Object.keys(conduitItemInfo).forEach((itemInfoKey, idx) => {
  let conduitKeyName = '';
  let conduitSpellId = 0;
  let conduitName = '';
  let conduitIcon = '';
  let conduitType = '';
  let conduitCovenant = 0;
  let soulbindConduitID = '';
  let conduitItemID = 0;
  let conduitRanks = '\t\t\t"0": 0';
  const conduitRanksArray = [0];

  let finishedRaidbotsLoop = false;
  Object.keys(conduitRaidbots).forEach(raidBotsKey => {
    if (finishedRaidbotsLoop) {
      return;
    }
    if (conduitRaidbots[raidBotsKey].itemId === conduitItemInfo[itemInfoKey].ItemID) {
      if (!conduitRaidbots[raidBotsKey].name) {
        return;
      }
      conduitName = conduitRaidbots[raidBotsKey].name;
      conduitKeyName = conduitName.replace(/(['\-,])/g, '').replace(/ /g, '_').toUpperCase();
      conduitType = conduitRaidbots[raidBotsKey].type;
      conduitIcon = conduitRaidbots[raidBotsKey].icon;
      conduitCovenant = conduitRaidbots[raidBotsKey].covenant;
      soulbindConduitID = conduitRaidbots[raidBotsKey].id;
      conduitItemID = conduitRaidbots[raidBotsKey].itemId;

      finishedRaidbotsLoop = true;
    }
  });

  let finishedRanksLoop = false;
  const maxRank = 15;
  Object.keys(conduitRankInfo).forEach(rankInfoKey => {
    if (finishedRanksLoop) {
      return;
    }
    if (conduitRankInfo[rankInfoKey].SoulbindConduitID === conduitItemInfo[itemInfoKey].ConduitID) {

      if (conduitRanks.length > 0) {
        conduitRanks += `,\n`;
      }

      conduitRanks += `\t\t\t"${Number([conduitRankInfo[rankInfoKey].RankIndex]) + 1}": ${[conduitRankInfo[rankInfoKey].AuraPointsOverride]}`;
      conduitRankInfo[rankInfoKey].AuraPointsOverride = ' ' + conduitRankInfo[rankInfoKey].AuraPointsOverride;
      conduitRanksArray.push(conduitRankInfo[rankInfoKey].AuraPointsOverride);

      conduitSpellId = conduitRankInfo[rankInfoKey].SpellID;

      if (conduitRankInfo[rankInfoKey].RankIndex + 1 === maxRank) {
        finishedRanksLoop = true;
      }
    }
  });

  if (!(conduitKeyName.length > 0)) {
    return;
  }
  fullOutput +=
    `\t"${conduitKeyName}": {
\t\t"id": ${conduitSpellId},
\t\t"name": "${conduitName}",
\t\t"icon": "${conduitIcon}",
\t\t"type": "${conduitType}",
\t\t"covenantID": ${conduitCovenant},
\t\t"soulbindConduitID": ${soulbindConduitID},
\t\t"conduitItemID": ${conduitItemID},
\t\t"AuraPointsOverride": [${conduitRanksArray}],
\t\t"AuraPointsOverrideKeyed": { \n${conduitRanks}\n\t\t}
    }${Object.keys(conduitItemInfo).length - 1 > idx ? ',' : ''}\n`;

  conduitName = conduitName.replace('\'', '\\\'');

  jsSpellOutput +=
    `  ${conduitKeyName}: {
    id: ${conduitSpellId},
    name: '${conduitName}',
    icon: '${conduitIcon}',
  },\n`;

  jsSpellScalingOutput += `\nconst ${conduitKeyName}_EFFECT_BY_RANK = [${conduitRanksArray}]; `;
});

fs.writeFileSync(
  'fullConduitInfo.json',
  `{\n${fullOutput}}`,
);

fs.writeFileSync(
  'conduitSpells.js',
  `// Generated file, changes will be overwritten!\n// Feel free to copy what you need from this file, as this is not indexed by anything else in the codebase.
export default {\n${jsSpellOutput}};`,
);

fs.writeFileSync(
  'conduitSpellScaling.js',
  `// Generated file, changes will be overwritten!\n// Feel free to copy what you need from this file, as this is not indexed by anything else in the codebase.${jsSpellScalingOutput}`,
);
