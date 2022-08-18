import fs from 'fs';

import {
  camalize,
  createTalentKey,
  csvToObject,
  findResourceCost,
  printTalents,
  readCsvFromUrl,
  readJsonFromUrl,
} from './talent-tree-helpers';
import {
  ISpellpower,
  ITalentObjectByClass,
  ITalentTree,
  ResourceCostType,
  ResourceTypes,
} from './talent-tree-types';

const WOW_BUILD_NUMBER = '10.0.0.45141';
const TALENT_DATA_URL = 'https://www.raidbots.com/static/data/beta/new-talent-trees.json';
const SPELLPOWER_DATA_URL = `https://wow.tools/dbc/api/export/?name=spellpower&build=${WOW_BUILD_NUMBER}`;

const classes: { [classId: number]: { name: string; baseMaxResource: number } } = {
  //TODO Non Mana users verification
  1: { name: 'Warrior', baseMaxResource: 1000 },
  2: { name: 'Paladin', baseMaxResource: 10000 },
  3: { name: 'Hunter', baseMaxResource: 100 },
  4: { name: 'Rogue', baseMaxResource: 100 },
  5: { name: 'Priest', baseMaxResource: 50000 },
  6: { name: 'Death Knight', baseMaxResource: 1000 },
  7: { name: 'Shaman', baseMaxResource: 10000 },
  8: { name: 'Mage', baseMaxResource: 50000 },
  9: { name: 'Warlock', baseMaxResource: 50000 },
  10: { name: 'Monk', baseMaxResource: 50000 },
  11: { name: 'Druid', baseMaxResource: 10000 },
  12: { name: 'Demon Hunter', baseMaxResource: 100 },
  13: { name: 'Evoker', baseMaxResource: 10000 },
};

async function generateTalents() {
  const talents: ITalentTree[] = await readJsonFromUrl(TALENT_DATA_URL);
  const spellpower: ISpellpower[] = csvToObject(await readCsvFromUrl(SPELLPOWER_DATA_URL));

  const talentObjectByClass: ITalentObjectByClass = {};

  //DISTRIBUTE TALENTS TO talentObjectByClass
  Object.values(talents).forEach((specTalents) => {
    const className = specTalents.className.replace(' ', '').toLowerCase();
    talentObjectByClass[className] = talentObjectByClass[className] || {};
    //Shared hasn't been populated yet, so let's do that
    talentObjectByClass[className]['Shared'] = talentObjectByClass[className]['Shared'] || {};
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
        const entryInSpellPowerTable = spellpower.find(
          (e) => parseInt(e.SpellID) === talentSpell.spellId,
        );
        if (entryInSpellPowerTable) {
          const resourceId = parseInt(entryInSpellPowerTable.PowerType);
          const resourceName = ResourceTypes[resourceId];
          const resourceCostKey = `${camalize(resourceName)}Cost` as ResourceCostType;
          talentObjectByClass[className]['Shared'][talentKey][resourceCostKey] = findResourceCost(
            entryInSpellPowerTable,
            resourceId,
            classes[specTalents.classId].baseMaxResource,
          );
        }
      });
    });
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
        const entryInSpellPowerTable = spellpower.find(
          (e) => parseInt(e.SpellID) === talentSpell.spellId,
        );
        if (entryInSpellPowerTable) {
          const resourceId = parseInt(entryInSpellPowerTable.PowerType);
          const resourceName = ResourceTypes[resourceId];
          const resourceCostKey = `${camalize(resourceName)}Cost` as ResourceCostType;
          talentObjectByClass[className][specTalents.specName][talentKey][
            resourceCostKey
          ] = findResourceCost(
            entryInSpellPowerTable,
            resourceId,
            classes[specTalents.classId].baseMaxResource,
          );
        }
      });
    });
  });

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
        .replace(' ', '_')} } from './${playerClass.name.toLowerCase().replace(' ', '')}';\n`,
  )
  .join('')}`,
  );
}

generateTalents();
generateIndex();
