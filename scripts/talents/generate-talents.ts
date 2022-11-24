import fs from 'fs';

import {
  camalize,
  createTalentKey,
  csvToObject,
  findResourceCost,
  printTalents,
  readCsvFromFile,
  readJsonFromUrl,
} from './talent-tree-helpers';
import {
  ISpellpower,
  ITalentObjectByClass,
  ITalentTree,
  ResourceCostType,
  ResourceTypes,
} from './talent-tree-types';

const WOW_BUILD_NUMBER = '10.0.2.46781';
const TALENT_DATA_URL = 'https://www.raidbots.com/static/data/beta/new-talent-trees.json';
const SPELLPOWER_DATA_FILE = `./spellpower_${WOW_BUILD_NUMBER}.csv`;

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
  const spellpower: ISpellpower[] = csvToObject(await readCsvFromFile(SPELLPOWER_DATA_FILE));

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
        //By default we just want to key with spell name & spec - we'll clean this up later.
        const talentKey = createTalentKey(talentSpell.name, specTalents.specName);

        talentObjectByClass[className]['Shared'][talentKey] = {
          id: talentSpell.spellId,
          name: talentSpell.name,
          icon: talentSpell.icon,
          //additional DF tree information
          maxRanks: talentSpell.maxRanks,
          //reqPoints: classTalent.reqPoints ?? 0,
          //spellType: talentSpell.type,
          //talentType: classTalent.type,
          //Debugging values used for filtering later on
          spec: specTalents.specName,
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
          //reqPoints: specTalent.reqPoints ?? 0,
          //spellType: talentSpell.type,
          //talentType: specTalent.type,
          //Debugging values used for filtering later on
          spec: specTalents.specName,
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

  //CLEAN THE OUTPUT
  const cleanedTalentObjectByClass: ITalentObjectByClass = {};
  Object.values(classes).forEach((playerClass) => {
    const lowerCasedClassName = playerClass.name.toLowerCase().replace(' ', '');
    cleanedTalentObjectByClass[lowerCasedClassName] =
      cleanedTalentObjectByClass[lowerCasedClassName] || {};

    const allClassTalentsArr = Object.values(
      talentObjectByClass[lowerCasedClassName],
    ).flatMap((spectalents) => Object.values(spectalents));

    Object.entries(talentObjectByClass[lowerCasedClassName]).forEach(([specName, specTalents]) => {
      cleanedTalentObjectByClass[lowerCasedClassName][specName] =
        cleanedTalentObjectByClass[lowerCasedClassName][specName] || {};

      Object.values(specTalents).forEach((talent) => {
        const talentKey = createTalentKey(talent.name);
        const sharedTalentKey = createTalentKey(talent.name, 'Shared');
        const specTalentKey = createTalentKey(talent.name, talent.spec);

        const multipleOfSameSpellId =
          allClassTalentsArr.filter((talentFromAllClasses) => talentFromAllClasses.id === talent.id)
            .length > 1;

        const sameNameDifferentSpellId =
          allClassTalentsArr.filter(
            (talentFromAllClasses) =>
              talentFromAllClasses.name === talent.name && talentFromAllClasses.id !== talent.id,
          ).length > 0;

        const hasBeenAdded =
          Object.values(cleanedTalentObjectByClass[lowerCasedClassName]).flatMap(
            (addedSpecTalents) => {
              return Object.values(addedSpecTalents).filter(
                (singleAddedTalent) => singleAddedTalent.id === talent.id,
              );
            },
          ).length > 0;

        //If no other spell with the same name exists, it's unique already
        //We assign NOTHING, as it's unique already
        if (!sameNameDifferentSpellId && !hasBeenAdded) {
          //If there are multiple of this spell, it's a shared spell
          if (multipleOfSameSpellId) {
            cleanedTalentObjectByClass[lowerCasedClassName]['Shared'][talentKey] = talent;
          } else {
            cleanedTalentObjectByClass[lowerCasedClassName][specName][talentKey] = talent;
          }
        }
        //If there are multiple of the same spell id AND there's a spell with same name but different spellID
        //We call it SHARED_
        else if (multipleOfSameSpellId && !hasBeenAdded) {
          cleanedTalentObjectByClass[lowerCasedClassName]['Shared'][sharedTalentKey] = talent;
        }
        //If there are multiples of this spell name but different IDs, we use spec
        else if (sameNameDifferentSpellId && !hasBeenAdded) {
          cleanedTalentObjectByClass[lowerCasedClassName][specName][specTalentKey] = talent;
        }
      });
    });
  });

  //WRITE TO FILE
  Object.values(classes).forEach((playerClass) => {
    const lowerCasedClassName = playerClass.name.toLowerCase().replace(' ', '');
    fs.writeFileSync(
      `./src/common/TALENTS/${lowerCasedClassName}.ts`,
      `// Generated file, changes will eventually be overwritten!
import { createTalentList } from './types';

const talents = createTalentList({${printTalents(cleanedTalentObjectByClass[lowerCasedClassName])}
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
