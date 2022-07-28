import fs from 'fs';

import {
  createTalentKey,
  csvToObject,
  printTalents,
  readCsvFromUrl,
  readJsonFromUrl,
} from './talent-tree-helpers';
import { ISpellpower, ITalentObjectByClass, ITalentTree } from './talent-tree-types';

const WOW_BUILD_NUMBER = '10.0.0.44707';
const TALENT_DATA_URL = 'https://www.raidbots.com/static/data/beta/new-talent-trees.json';
const SPELLPOWER_DATA_URL = `https://wow.tools/dbc/api/export/?name=spellpower&build=${WOW_BUILD_NUMBER}`;

const debug = false;

const classes: { [classID: number]: { name: string; specs: { [specID: number]: string } } } = {
  1: { name: 'Warrior', specs: { 71: 'Arms', 72: 'Fury', 73: 'Protection' } },
  2: { name: 'Paladin', specs: { 65: 'Holy', 66: 'Protection', 70: 'Retribution' } },
  3: { name: 'Hunter', specs: { 253: 'Beast Mastery', 254: 'Marksmanship', 255: 'Survival' } },
  4: { name: 'Rogue', specs: { 259: 'Assassination', 260: 'Outlaw', 261: 'Subtlety' } },
  5: { name: 'Priest', specs: { 256: 'Discipline', 257: 'Holy', 258: 'Shadow' } },
  6: { name: 'Death Knight', specs: { 250: 'Blood', 251: 'Frost', 252: 'Unholy' } },
  7: { name: 'Shaman', specs: { 262: 'Elemental', 263: 'Enhancement', 264: 'Restoration' } },
  8: { name: 'Mage', specs: { 62: 'Arcane', 63: 'Fire', 64: 'Frost' } },
  9: { name: 'Warlock', specs: { 265: 'Affliction', 266: 'Demonology', 267: 'Destruction' } },
  10: { name: 'Monk', specs: { 268: 'Brewmaster', 269: 'Windwalker', 270: 'Mistweaver' } },
  11: {
    name: 'Druid',
    specs: { 102: 'Balance', 103: 'Feral', 104: 'Guardian', 105: 'Restoration' },
  },
  12: { name: 'Demon Hunter', specs: { 577: 'Havoc', 581: 'Vengeance' } },
  13: { name: 'Evoker', specs: { 1467: 'Devastation', 1468: 'Preservation' } },
};

async function generateTalents() {
  // CSV -> JSON
  const talents: ITalentTree[] = await readJsonFromUrl(TALENT_DATA_URL);
  // CSV -> Json -> Object
  const spellpower: ISpellpower[] = csvToObject<ISpellpower>(
    await readCsvFromUrl(SPELLPOWER_DATA_URL),
  );

  const talentObjectByClass: ITalentObjectByClass = {};

  //DISTRIBUTE TALENTS TO talentObjectByClass
  Object.values(talents).forEach((specTalents) => {
    const className = specTalents.className.replace(' ', '').toLowerCase();
    talentObjectByClass[className] = talentObjectByClass[className] || {};
    //Shared hasn't been populated yet, so let's do that
    if (!talentObjectByClass[className]['Shared']) {
      talentObjectByClass[className]['Shared'] = {};
      Object.values(specTalents.classNodes).forEach((classTalent) => {
        classTalent.entries.forEach((talentSpell) => {
          if (!talentSpell.name || !talentSpell.spellId) {
            return;
          }
          const talentKey = createTalentKey(talentSpell.name);
          talentObjectByClass[className]['Shared'][talentKey] = {
            id: talentSpell.spellId,
            name: talentSpell.name,
            icon: talentSpell.icon,
            //additional DF tree information
            maxRanks: talentSpell.maxRanks,
            reqPoints: classTalent.reqPoints ?? 0,
            spellType: talentSpell.type,
            talentType: classTalent.type,
          };
        });
      });
    }
    talentObjectByClass[className][specTalents.specName] = {};
    Object.values(specTalents.specNodes).forEach((specTalent) => {
      specTalent.entries.forEach((talentSpell) => {
        if (!talentSpell.name || !talentSpell.spellId) {
          return;
        }
        const talentKey = createTalentKey(talentSpell.name, specTalents.specName);
        talentObjectByClass[className][specTalents.specName][talentKey] = {
          id: talentSpell.spellId,
          name: talentSpell.name,
          icon: talentSpell.icon,
          //additional DF tree information
          maxRanks: talentSpell.maxRanks,
          reqPoints: specTalent.reqPoints ?? 0,
          spellType: talentSpell.type,
          talentType: specTalent.type,
        };
      });
    });
  });

  //DISTRIBUTE SPELLCOSTS
  if (debug) {
    console.log(spellpower);
  }
  //WRITE TO FILE
  Object.values(classes).forEach((playerClass) => {
    const lowerCasedClassName = playerClass.name.toLowerCase().replace(' ', '');
    if (lowerCasedClassName === 'druid') {
      //console.log(printTalents(talentObjectByClass[lowerCasedClassName]));
    }
    fs.writeFileSync(
      `./src/common/TALENTS/${lowerCasedClassName}.ts`,
      `// Generated file, changes will eventually be overwritten!
import { createTalentList } from './types';

const talents = createTalentList({${printTalents(talentObjectByClass[lowerCasedClassName])}
  });

export default talents;
export { talents as TALENTS_${playerClass.name.toUpperCase().replace(' ', '_')}}
    `,
    );
  });
}

function generateIndex() {
  fs.writeFileSync(
    `./src/common/TALENTS/index.ts`,
    `// Generated file, changes will eventually be overwritten!
${Object.values(classes)
  .map(
    (playerClass) =>
      `export { TALENTS_${playerClass.name
        .toUpperCase()
        .replace(' ', '_')} } from './${playerClass.name.toLowerCase().replace(' ', '')}';`,
  )
  .join('\n')}
  `,
  );
}

generateTalents();
generateIndex();
