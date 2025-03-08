import fs from 'fs';

import {
  camalize,
  createTalentKey,
  csvToObject,
  findResourceCost,
  findResourceCostPerSecond,
  printTalents,
  readCsvFromUrl,
  readJsonFromUrl,
} from './talent-tree-helpers';
import {
  ClassNodeType,
  GenericTalentInterface,
  ISpellpower,
  ITalentTree,
  ResourceCostPerSecondType,
  ResourceCostType,
  ResourceTypes,
  TalentEntry,
  TalentNode,
} from './talent-tree-types';

const LIVE_WOW_BUILD_NUMBER = '11.1.0.59347';
const LIVE_TALENT_DATA_URL = 'https://www.raidbots.com/static/data/live/talents.json';
const LIVE_SPELLPOWER_DATA_URL = `https://wago.tools/db2/SpellPower/csv?build=${LIVE_WOW_BUILD_NUMBER}`;
const PTR_WOW_BUILD_NUMBER = LIVE_WOW_BUILD_NUMBER;
const PTR_TALENT_DATA_URL = `https://www.raidbots.com/static/data/${PTR_WOW_BUILD_NUMBER}/talents.json`;
const PTR_SPELLPOWER_DATA_URL = `https://wago.tools/db2/SpellPower/csv?build=${PTR_WOW_BUILD_NUMBER}`;

const classes: { [classId: number]: { name: string; baseMaxResource: number } } = {
  1: { name: 'Warrior', baseMaxResource: 1000 },
  2: { name: 'Paladin', baseMaxResource: 2500000 },
  3: { name: 'Hunter', baseMaxResource: 100 },
  4: { name: 'Rogue', baseMaxResource: 100 },
  5: { name: 'Priest', baseMaxResource: 2500000 },
  6: { name: 'Death Knight', baseMaxResource: 1000 },
  7: { name: 'Shaman', baseMaxResource: 2500000 },
  8: { name: 'Mage', baseMaxResource: 2500000 },
  9: { name: 'Warlock', baseMaxResource: 2500000 },
  10: { name: 'Monk', baseMaxResource: 2500000 },
  11: { name: 'Druid', baseMaxResource: 2500000 },
  12: { name: 'Demon Hunter', baseMaxResource: 100 },
  13: { name: 'Evoker', baseMaxResource: 2500000 },
};

const withResources = (
  spellpower: ISpellpower[],
  talent: GenericTalentInterface,
  classId: number,
): GenericTalentInterface => {
  const spellPowerEntries = spellpower.filter((e) => Number(e.SpellID) === talent.id);
  let updatedTalent = talent;
  for (const entryInSpellPowerTable of spellPowerEntries) {
    const resourceId = Number(entryInSpellPowerTable.PowerType);
    const resourceName = ResourceTypes[resourceId];
    if (resourceName === undefined) {
      // not all resources are in the enum. in particular: -2 is used for healing (i think?) and is not present
      continue;
    }
    const resourceCostKey = `${camalize(resourceName)}Cost` as ResourceCostType;
    const resourceCostPerSecondKey = `${camalize(
      resourceName,
    )}CostPerSecond` as ResourceCostPerSecondType;
    const cost = findResourceCost(
      entryInSpellPowerTable,
      resourceId,
      classes[classId].baseMaxResource,
    );
    const costPerSecond = findResourceCostPerSecond(
      entryInSpellPowerTable,
      resourceId,
      classes[classId].baseMaxResource,
    );

    if (cost !== 0) {
      updatedTalent = {
        ...updatedTalent,
        // use the lowest observed non-zero cost.
        // note: this is non-zero because we never reach this point with a 0 cost
        [resourceCostKey]: Math.min(cost, updatedTalent[resourceCostKey] ?? Infinity),
      };
    }
    if (costPerSecond !== 0) {
      updatedTalent = {
        ...updatedTalent,
        // use the lowest observed non-zero cost.
        // note: this is non-zero because we never reach this point with a 0 cost
        [resourceCostPerSecondKey]: Math.min(
          costPerSecond,
          updatedTalent[resourceCostPerSecondKey] ?? Infinity,
        ),
      };
    }
  }

  return updatedTalent;
};

const entryToSpell = (
  entry: TalentEntry,
  spec: string,
  specId: number,
  sourceTree: 'class' | 'spec' | 'hero',
): GenericTalentInterface => ({
  id: entry.spellId!,
  name: entry.name!,
  icon: entry.icon.replace(/\.(tga|jpg)$/, ''),
  //additional DF tree information
  maxRanks: entry.maxRanks,
  //reqPoints: classTalent.reqPoints ?? 0,
  //spellType: talentSpell.type,
  //talentType: classTalent.type,
  //Debugging values used for filtering later on
  spec,
  sourceTree,
  entryIds: [entry.id],
  definitionIds: [{ id: entry.definitionId, specId }],
});

/**
 * check if we can safely merge two talent objects. the requirements are:
 *
 * - they must have the same name
 * - they must have the same spell id
 * - they must occur for different specs
 * - they cannot be across different tree types (e.g. class + spec)
 */
const canSafelyMerge = (left: GenericTalentInterface, right: GenericTalentInterface): boolean =>
  left.name === right.name &&
  left.id === right.id &&
  left.spec !== right.spec &&
  left.sourceTree === right.sourceTree;

/**
 * Merge talent objects without confirming the validity. Left-biased.
 */
const blindMergeTalents = (
  left: GenericTalentInterface,
  right: GenericTalentInterface,
): GenericTalentInterface => ({
  ...left,
  entryIds: [...left.entryIds, ...right.entryIds],
  definitionIds: Array.from(
    new Map(
      [...left.definitionIds, ...right.definitionIds].map((item) => [item['id'], item]),
    ).values(),
  ),
});

function nodeEntries(node: TalentNode): TalentEntry[] {
  if (node.type === ClassNodeType.Choice) {
    return node.entries;
  } else {
    // this deals with Unbreakable Stride / Cheat Death being a "single" node with an orphaned Cheat Death choice
    return node.entries.slice(0, 1);
  }
}

async function generateTalents(isPTR: boolean = false) {
  const talents: ITalentTree[] = await readJsonFromUrl(
    isPTR ? PTR_TALENT_DATA_URL : LIVE_TALENT_DATA_URL,
  );

  const spellpowerCsv = await readCsvFromUrl(
    isPTR ? PTR_SPELLPOWER_DATA_URL : LIVE_SPELLPOWER_DATA_URL,
  );
  // eslint-disable-next-line
  const spellpower: ISpellpower[] = csvToObject(spellpowerCsv);

  const talentsByClass = talents.reduce((map: Record<string, ITalentTree[]>, tree) => {
    const className = tree.className;
    if (!map[className]) {
      map[className] = [];
    }
    map[className].push(tree);
    return map;
  }, {});

  const keyedTalentsByClass: Array<{
    className: string;
    talents: {
      key: string;
      value: GenericTalentInterface;
    }[];
  }> = Object.entries(talentsByClass).flatMap(([className, trees]) => {
    const specTalents = trees.flatMap((tree) =>
      tree.specNodes.flatMap((node) =>
        nodeEntries(node)
          .filter((entry) => entry.spellId && entry.name)
          .map((entry) => ({
            key: createTalentKey(entry.name!),
            conflictKey: createTalentKey(entry.name!, tree.specName),
            value: entryToSpell(entry, tree.specName, tree.specId, 'spec'),
          })),
      ),
    );

    const heroTalents = trees.flatMap((tree) =>
      tree.heroNodes.flatMap((node) =>
        nodeEntries(node)
          .filter((entry) => entry.spellId && entry.name)
          .map((entry) => ({
            key: createTalentKey(entry.name!),
            conflictKey: createTalentKey(entry.name!, tree.specName),
            value: entryToSpell(entry, tree.specName, tree.specId, 'hero'),
          })),
      ),
    );

    // we have to process ALL class nodes, not just the first tree due to (basically) Warriors.
    const classTalents: typeof specTalents = trees.flatMap((tree) =>
      tree.classNodes.flatMap((node) =>
        nodeEntries(node)
          .filter((entry) => entry.spellId && entry.name)
          .map((entry) => ({
            key: createTalentKey(entry.name!),
            conflictKey: createTalentKey(entry.name!, 'Shared'),
            value: entryToSpell(entry, tree.specName, tree.specId, 'class'),
          })),
      ),
    );

    // we build up a table of everything by the key we *want*. there may be
    // conflicts, so the table tracks the information that we need in order
    // to safely disambiguate
    const talentsByKey: Record<string, typeof classTalents> = {};

    [classTalents, specTalents, heroTalents].forEach((list) => {
      list.forEach((talent) => {
        if (!talentsByKey[talent.key]) {
          talentsByKey[talent.key] = [];
        }

        talentsByKey[talent.key].push(talent);
      });
    });

    // the table has been built, now we can disambiguate.
    const talentObjects = Object.values(talentsByKey).flatMap((collidingTalents) => {
      if (collidingTalents.length <= 1) {
        // easy case: no collision
        return collidingTalents;
      }

      // attempt to merge talents into a single one. ideally, we merge them all and can just produce a single talent object
      const result: typeof classTalents = [];
      while (collidingTalents.length > 0) {
        const next = collidingTalents.shift()!;
        const target = result.find((prev) => canSafelyMerge(prev.value, next.value));
        if (target) {
          // there exists a talent that we can merge this into. do so
          target.value = blindMergeTalents(target.value, next.value);
          if (
            target.value.spec !== next.value.spec &&
            target.value.sourceTree === 'spec' &&
            next.value.sourceTree === 'spec'
          ) {
            // replace the conflictKey for future steps. this is basically a shadowstep special case
            target.conflictKey = createTalentKey(target.value.name, 'Spec');
          }
        } else {
          // no valid merge target. append to result list
          result.push(next);
        }
      }

      // if the result is only a single object, we're done
      if (result.length === 1) {
        return result;
      }

      // otherwise, check if every conflict key is unique. if so, use those.
      if (new Set(result.map((talent) => talent.conflictKey)).size === result.length) {
        return result.map((talent) => ({
          key: talent.conflictKey,
          value: talent.value,
        }));
      }

      // otherwise, check if all the talents are in the class tree for different specs. if so, we fall back to the shared vs spec disambiguation method
      if (
        result.every((talent) => talent.value.sourceTree === 'class') &&
        new Set(result.map((talent) => talent.value.spec)).size === result.length
      ) {
        // there should be up to 1 talent with multiple entry ids
        if (result.filter((talent) => talent.value.entryIds.length > 1).length > 1) {
          console.dir(result, { depth: null });
          throw new Error(
            `unable to generate talents for ${className}: ${result[0].value.name} has multiple nodes with multiple entries`,
          );
        }

        return result.map((talent) => {
          if (talent.value.entryIds.length > 1) {
            return {
              key: createTalentKey(talent.value.name, 'Shared'),
              value: talent.value,
            };
          } else {
            return {
              key: createTalentKey(talent.value.name, talent.value.spec),
              value: talent.value,
            };
          }
        });
      }

      // the final case that we support is that every talent is in a spec tree, but some are in the same spec tree.
      // in this case, we disambiguate within each spec by numeric indices. not pretty, but it works
      if (
        result.every((talent) => talent.value.sourceTree === 'spec') ||
        result.every((talent) => talent.value.sourceTree === 'hero')
      ) {
        const bySpec: Record<string, GenericTalentInterface[]> = {};

        for (const talent of result) {
          if (!bySpec[talent.value.spec!]) {
            bySpec[talent.value.spec!] = [];
          }

          bySpec[talent.value.spec!].push(talent.value);
        }

        return Object.values(bySpec).flatMap((talents) => {
          if (talents.length === 1) {
            return [
              {
                key: createTalentKey(talents[0].name, talents[0].spec),
                value: talents[0],
              },
            ];
          }

          return talents.map((talent, index) => ({
            key: createTalentKey(`${talent.name} ${index + 1}`, talent.spec),
            value: talent,
          }));
        });
      }

      // give up
      console.dir(result, { depth: null });
      throw new Error(
        `unable to generate talents for ${className}: ${result[0].value.name} cannot be built`,
      );
    });

    return {
      className,
      // one final map
      talents: talentObjects.map((talent) => ({
        ...talent,
        value: withResources(spellpower, talent.value, trees[0].classId),
      })),
    };
  });

  //WRITE TO FILE
  keyedTalentsByClass.forEach(({ className, talents }) => {
    console.log(`Writing talents for ${className}...`);
    const lowerCasedClassName = className.toLowerCase().replace(' ', '');
    fs.writeFileSync(
      `./src/common/TALENTS/${lowerCasedClassName}.ts`,
      `// Generated file, changes will eventually be overwritten!
import { Talent } from './types';

const talents = {${printTalents(talents)}} satisfies Record<string, Talent>;

export default talents;
export { talents as TALENTS_${className.toUpperCase().replace(' ', '_')}}
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

const isPTR = process.argv.includes('--ptr');

generateTalents(isPTR);
generateIndex();
