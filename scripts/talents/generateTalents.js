const fs = require('fs');

const SHARED = 'Shared';
const TALENTS_DIRECTORY = '../../src/common/SPELLS/talents';

const debugDelete = false;
const debugDeduplicate = true;

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

const classes = {
  1: 'Warrior',
  2: 'Paladin',
  3: 'Hunter',
  4: 'Rogue',
  5: 'Priest',
  6: 'Death Knight',
  7: 'Shaman',
  8: 'Mage',
  9: 'Warlock',
  10: 'Monk',
  11: 'Druid',
  12: 'Demon Hunter',
};

const resourceTypes = {
  0: 'Mana',
  1: 'Rage',
  2: 'Focus',
  3: 'Energy',
  4: 'Combo Points',
  5: 'Runes',
  6: 'Runic Power',
  7: 'Soul Shards',
  8: 'Astral Power',
  9: 'Holy Power',
  10: 'Alternate Power',
  11: 'Maelstrom',
  12: 'Chi',
  13: 'Insanity',
  16: 'Arcane Charges',
  17: 'Fury',
  18: 'Pain',
};

const baseMaxMana = 50000;

//Retrieved from https://www.raidbots.com/static/data/live/talents.json
const talents = readJson('./talents.json');
//Keyed json converted from the csv retrieved from here from https://wow.tools/dbc/?dbc=spellpower&build=9.0.2.36949
const spellpower = readJson('./spellpower.json');

const toCamelCase = (str) => str.toLowerCase().replace(/(?:^\w|[A-Z]|\b\w)/g, (ltr, idx) => idx === 0 ? ltr.toLowerCase() : ltr.toUpperCase()).replace(/\s+/g, '');

function flattenClassTalents(classTalents) {
  const flat = [];
  classTalents.forEach(talentRow => {
    talentRow.forEach(talentColumn => {
      talentColumn.forEach(talent => {
        flat.push(talent);
      });
    });
  });
  return flat;
}

function findResource(spellPowerObj) {
  let resourceName = 'Mana';
  Object.keys(resourceTypes).forEach(resourceTypeId => {
    if (Number(resourceTypeId) === spellPowerObj.PowerType) {
      resourceName = resourceTypes[resourceTypeId];
    }
  });
  return resourceName;
}

function findResourceCost(spellPowerObj, className, resourceName) {
  if (spellPowerObj.PowerCostPct > 0) {
    return Math.round(spellPowerObj.PowerCostPct / 100 * baseMaxMana);
  } else {
    if (['Runic Power', 'Rage', 'Soul Shards', 'Pain'].includes(resourceName)) {
      return spellPowerObj.ManaCost / 10;
    }
  }
  return spellPowerObj.ManaCost;
}

function getTalentKeyName(talent) {
  return talent.name.replace(/([,':])/g, '').replace(/([ -])/g, '_').toUpperCase() + '_TALENT';
}

function getSpecCategory(talent, spellList) {
  const alreadyInShared = Object.values(spellList[SHARED]).find(spell => spell.id === talent.spell.id) !== undefined;
  if (alreadyInShared) {
    return SHARED;
  }

  if (!talent.spec) {
    return SHARED;
  }

  let category = talent.spec.name;

  Object.keys(spellList).forEach(spec => {
    const keyOfExisting = Object.keys(spellList[spec]).find(key => spellList[spec][key].id === talent.spell.id);
    if (keyOfExisting) {
      debugDelete && console.log('Deleting', spec, keyOfExisting);
      delete spellList[spec][keyOfExisting];
      category = SHARED;
    }
  });

  return category;

}

function checkForDuplicates(talentList) {
  const deduplicatedTalentList = talentList;
  Object.keys(talentList).forEach(spec => {
    Object.keys(talentList[spec]).forEach(talentKey => {
      const talent = talentList[spec][talentKey];

      const hasDuplicate = Object.values(talentList).find(specTalents =>
        Object.keys(specTalents).find(key => {
          const altTalent = specTalents[key];
          return key === talentKey && altTalent.id !== talent.id;
        }));

      if (hasDuplicate) {
        Object.keys(talentList).forEach(duplicateSpecName => {
          const duplicateSpecTalents = talentList[duplicateSpecName];
          Object.keys(duplicateSpecTalents).forEach(key => {
            if (key === talentKey) {
              debugDeduplicate && console.log('Deduplicating', talentKey, 'in', duplicateSpecName);
              const newKey = `${talentKey}_${duplicateSpecName.replace(' ', '_').toUpperCase()}`;
              duplicateSpecTalents[newKey] = duplicateSpecTalents[talentKey];
              delete duplicateSpecTalents[talentKey];
            }
          });
        });
        delete deduplicatedTalentList[spec][talentKey];
      }
    });
  });

  return deduplicatedTalentList;
}

Object.keys(talents).forEach(classId => {
  const className = classes[classId].toUpperCase();
  let spellList = {
    [SHARED]: {},
  };

  const flattened = flattenClassTalents(talents[classId].talents);

  flattened.forEach(talent => {
    const spell = talent.spell;

    const talentSpellObject = {
      id: spell.id,
      name: spell.name,
      icon: spell.icon,
    };

    Object.keys(spellpower).forEach(spellPowerID => {
      if (spellpower[spellPowerID].SpellID === spell.id) {
        const resourceName = findResource(spellpower[spellPowerID]);
        if (resourceName) {
          const resourceNameCamelCase = toCamelCase(resourceName) + 'Cost';
          const cost = findResourceCost(spellpower[spellPowerID], className, resourceName);
          talentSpellObject[resourceNameCamelCase] = cost;
        }
      }
    });

    const talentKeyName = getTalentKeyName(talent.spell);
    const specCategory = getSpecCategory(talent, spellList);
    spellList[specCategory] = spellList[specCategory] || {};
    spellList[specCategory][talentKeyName] = talentSpellObject;
  });

  spellList = checkForDuplicates(spellList);

  fs.writeFileSync(
    `${TALENTS_DIRECTORY}/${className.toLowerCase().replace(' ', '')}.ts`,
    `// Generated file, changes will be overwritten!
import { SpellList } from '../Spell';

const talents: SpellList = {
${Object.keys(spellList).map(spec => `\t//${spec}
${Object.keys(spellList[spec]).map(talent => `  ${talent}: { ${Object.keys(spellList[spec][talent]).map(attribute => `${attribute}: ${JSON.stringify(spellList[spec][talent][attribute])}`).join(', ')} },`).join('\n')}
`).join('\n')}
};
export default talents;`);

});
