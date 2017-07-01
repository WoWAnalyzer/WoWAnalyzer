const fs = require("fs");

const talents = require('./talents.json');

const SHARED = 'Shared';
const TALENTS_DIRECTORY = '../common/talents';

/**
 * Gets the desired category for a talent. This also mutates the `spells` argument if the talent was added previously and turns out to be a shared talent. THis can happen when specs share talents but not on the same row.
 * @param talent
 * @param spells
 * @returns {string}
 */
function getCategory(talent, spells) {
  // Check if already exists in shared talents
  const exists = Object.values(spells[SHARED]).find(spell => spell.id === talent.spell.id) !== undefined;
  if (exists) {
    return SHARED;
  }

  if (!talent.spec) {
    return SHARED;
  }

  let category = talent.spec.name;

  // Check if already exists in a spec, in that case we want it marked as shared (this happens when specs share a spell but they're not on the same row)
  Object.keys(spells).forEach(specName => {
    const existingKey = Object.keys(spells[specName]).find(key => spells[specName][key].id === talent.spell.id);

    if (existingKey) {
      console.log('Deleting', specName, existingKey);
      delete spells[specName][existingKey];
      category = SHARED;
    }
  });

  return category;
}
function flattenTalents(talents) {
  const flat = [];
  talents.talents.forEach(tier => {
    tier.forEach(column => {
      column.forEach(talent => {
        flat.push(talent);
      });
    });
  });
  return flat;
}
function getIdentifier(spell) {
  return `${spell.name.toUpperCase().replace(/[^A-Z ]/g, '').replace(/ /g, '_')}_TALENT`;
}

Object.values(talents).forEach(classTalents => {
  const className = classTalents.class.replace('-', '_').toUpperCase();
  console.log(className);

  const spells = {
    [SHARED]: {},
  };

  const flat = flattenTalents(classTalents);
  flat.forEach(talent => {
    const spell = talent.spell;

    const spellsTalent = {
      id: spell.id,
      name: spell.name,
      icon: spell.icon,
    };
    if (spell.powerCost) {
      const mana = spell.powerCost.match(/^([0-9.]+)% of base mana$/);
      if (mana) {
        spellsTalent.baseMana = Math.round(mana[1] / 100 * 10000) / 10000;
      }
      // TODO: As desired add other powers
    }

    const identifier = getIdentifier(spell);
    const category = getCategory(talent, spells);
    spells[category] = spells[category] || {};
    spells[category][identifier] = spellsTalent;
  });

  // If the talent already exists, another spec has a talent by the same name. Deduplicate talent names with shared names
  Object.keys(spells).forEach(specName => {
    Object.keys(spells[specName]).forEach(spellKey => {
      const talent = spells[specName][spellKey];

      const hasDuplicate = Object.values(spells).find(specTalents => {
        return Object.keys(specTalents).find(key => {
          const altTalent = specTalents[key];
          return key === spellKey && altTalent.id !== talent.id;
        });
      });

      if (hasDuplicate) {
        Object.keys(spells).forEach(duplicateSpecName => {
          const duplicateSpecTalents = spells[duplicateSpecName];
          Object.keys(duplicateSpecTalents).forEach(key => {
            if (key === spellKey) {
              console.log('Deduplicating', spellKey, 'in', duplicateSpecName);
              const newKeyIdentifier = `${spellKey}_${duplicateSpecName.toUpperCase()}`;
              duplicateSpecTalents[newKeyIdentifier] = duplicateSpecTalents[spellKey];
              delete duplicateSpecTalents[key];
            }
          });
        });
        delete spells[specName][spellKey];
      }
    });
  });

  const fileName = `TALENTS_${className}.js`;
  fs.writeFileSync(
    `${TALENTS_DIRECTORY}/${fileName}`,
    `// Generated file, changes will be overwritten!
// ${new Date()}

export default {
${Object.keys(spells).map(specName => {
  return `  // ${specName}
${Object.keys(spells[specName]).map(talentName => {
  return `  ${talentName}: { ${Object.keys(spells[specName][talentName]).map(prop => `${prop}: ${JSON.stringify(spells[specName][talentName][prop])}`).join(', ')} },`;
}).join("\n")}`;
}).join("\n")}
};
`);
  console.log('Saving', fileName);
});
