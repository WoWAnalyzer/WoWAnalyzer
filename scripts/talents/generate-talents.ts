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

const WOW_BUILD_NUMBER = '10.0.2.46157';
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

  //Talents that have different IDs but the same name a class talent tree
  const duplicateClassTalentNames: Record<string, { id: number; name: string }[]> = {};
  //Talents that have the same name and ID that have already been marked Shared
  const sharedClassTalentNames: Record<string, { id: number; name: string }[]> = {};

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
        //By default we just want to key with spell name
        let talentKey = createTalentKey(talentSpell.name);

        //But sometimes we want to mark a talent as shared
        const sharedTalentKey = createTalentKey(talentSpell.name, 'Shared');

        //Detect if any talents exist with the same ID
        const classTalentsWithSameId = Object.values(
          talentObjectByClass[className]['Shared'],
        ).filter((entry) => entry.id === talentSpell.spellId);

        //Detect duplicates in class tree
        if (
          talentObjectByClass[className]['Shared'][talentKey] ||
          classTalentsWithSameId.length > 0
        ) {
          //Mark the spell as a troublesome talent, so that its detectable later
          duplicateClassTalentNames[className] = duplicateClassTalentNames[className] || [];
          duplicateClassTalentNames[className].push({
            id: talentSpell.spellId,
            name: talentSpell.name,
          });

          //Reallocate to have spec specific keys if they have different IDs
          if (classTalentsWithSameId.length === 0) {
            //Find the previously added class talent and reallocate it under shared for now
            const oldTalent = talentObjectByClass[className]['Shared'][talentKey];
            talentObjectByClass[className]['Shared'][sharedTalentKey] = oldTalent;

            //Remove the old talent with wrong key
            delete talentObjectByClass[className]['Shared'][talentKey];

            //Create new key using spec name
            talentKey = createTalentKey(talentSpell.name, specTalents.specName);
          }

          sharedClassTalentNames[className] = sharedClassTalentNames[className] || [];
          const isMarkedShared =
            sharedClassTalentNames[className].filter(
              (sharedTalent) => sharedTalent.name === talentSpell.name,
            ).length > 0;

          const classTalentsWithSameNameDifferentId = Object.values(
            talentObjectByClass[className]['Shared'],
          ).filter((entry) => entry.id !== talentSpell.spellId && entry.name === talentSpell.name);
          if (
            classTalentsWithSameId.length > 0 &&
            !isMarkedShared &&
            classTalentsWithSameNameDifferentId.length > 0
          ) {
            //Remove the old talents with the non-shared keys
            classTalentsWithSameId.forEach((dupeSpell) => {
              const dupeTalentKey = createTalentKey(dupeSpell.name);
              const dupeTalentKeyWithSpec = createTalentKey(dupeSpell.name, dupeSpell.spec);
              if (talentObjectByClass[className]['Shared'][dupeTalentKey]) {
                delete talentObjectByClass[className]['Shared'][dupeTalentKey];
              }
              if (talentObjectByClass[className]['Shared'][dupeTalentKeyWithSpec]) {
                delete talentObjectByClass[className]['Shared'][dupeTalentKeyWithSpec];
              }
            });
            //Create new key using SHARED
            talentKey = sharedTalentKey;
            //Mark the talent as shared
            sharedClassTalentNames[className].push({
              id: talentSpell.spellId,
              name: talentSpell.name,
            });
          }
        }

        //If it's a key that already exists and it has the same id as an existing spell we don't want to add it
        const equalToShared =
          talentObjectByClass[className]['Shared'][sharedTalentKey] &&
          talentObjectByClass[className]['Shared'][sharedTalentKey].id === talentSpell.spellId;
        if (
          classTalentsWithSameId.length > 0 &&
          (talentObjectByClass[className]['Shared'][talentKey] || equalToShared)
        ) {
          return;
        }

        talentObjectByClass[className]['Shared'][talentKey] = {
          id: talentSpell.spellId,
          name: talentSpell.name,
          icon: talentSpell.icon,
          //Information used for debugging and ensuring we filter the data properly
          spec: specTalents.specName,
          //additional DF tree information
          maxRanks: talentSpell.maxRanks,
          //reqPoints: classTalent.reqPoints ?? 0,
          //spellType: talentSpell.type,
          //talentType: classTalent.type,
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
        let talentKey = createTalentKey(talentSpell.name); //createTalentKey(talentSpell.name, specTalents.specName);
        let shouldBeShared = false;

        Object.keys(talentObjectByClass[className]).forEach((specKey) => {
          //First we create a new key for the previously added talent but this time with spec name in it
          const talentKeyWithSpecName = createTalentKey(talentSpell.name as string, specKey);

          //Has an entry been added to the object under the desired key already?
          if (talentObjectByClass[className][specKey][talentKey]) {
            //Is the added entry the same id as the current talent, if yes, then we should consider it a shared talent
            if (talentObjectByClass[className][specKey][talentKey].id === talentSpell.spellId) {
              talentObjectByClass[className]['Shared'][talentKey] =
                talentObjectByClass[className][specKey][talentKey];
              shouldBeShared = true;
              delete talentObjectByClass[className][specKey][talentKey];
            } else {
              //We want to remove this existing talent as it's keyed without spec name but there are
              //multiple instances of the talent name, but they have different IDs so they must be different
              //We assign the previous value to the new key
              talentObjectByClass[className][specKey][talentKeyWithSpecName] =
                talentObjectByClass[className][specKey][talentKey];

              //We remove the old entry
              delete talentObjectByClass[className][specKey][talentKey];
              //We create a talent key using the specName that we are currenty looking at for use below
              talentKey = createTalentKey(talentSpell.name as string, specTalents.specName);
            }
          }
          if (talentObjectByClass[className][specKey][talentKeyWithSpecName]) {
            talentKey = createTalentKey(talentSpell.name as string, specTalents.specName);
          }
        });

        talentObjectByClass[className][shouldBeShared ? 'Shared' : specTalents.specName][
          talentKey
        ] = {
          id: talentSpell.spellId,
          name: talentSpell.name,
          icon: talentSpell.icon,
          //additional DF tree information
          maxRanks: talentSpell.maxRanks,
          //reqPoints: specTalent.reqPoints ?? 0,
          //spellType: talentSpell.type,
          //talentType: specTalent.type,
        };
        const entryInSpellPowerTable = spellpower.find(
          (e) => parseInt(e.SpellID) === talentSpell.spellId,
        );
        if (entryInSpellPowerTable) {
          const resourceId = parseInt(entryInSpellPowerTable.PowerType);
          const resourceName = ResourceTypes[resourceId];
          const resourceCostKey = `${camalize(resourceName)}Cost` as ResourceCostType;
          talentObjectByClass[className][shouldBeShared ? 'Shared' : specTalents.specName][
            talentKey
          ][resourceCostKey] = findResourceCost(
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
