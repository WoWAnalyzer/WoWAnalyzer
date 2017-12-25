const fs = require('fs');

const talents = require('./talents.json');

const SHARED = 'Shared';
const TALENTS_DIRECTORY = '../common/SPELLS/TALENTS';

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
  Object.keys(spells).forEach((specName) => {
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
  talents.talents.forEach((tier) => {
    tier.forEach((column) => {
      column.forEach((talent) => {
        flat.push(talent);
      });
    });
  });
  return flat;
}
function getIdentifier(spell) {
  return `${spell.name.toUpperCase().replace(/[^A-Z ]/g, '').replace(/ /g, '_')}_TALENT`;
}

const BASE_MANA = {
  DEATH_KNIGHT: 220000,
  DEMON_HUNTER: 220000,
  DRUID: 220000,
  HUNTER: 220000,
  ROGUE: 220000,
  MAGE: 1100000,
  MONK: 1100000,
  PALADIN: 220000,
  PRIEST: 1100000,
  SHAMAN: 220000,
  WARLOCK: 1100000,
  WARRIOR: 220000,
};

Object.values(talents).forEach((classTalents) => {
  const className = classTalents.class.replace('-', '_').toUpperCase();

  const spells = {
    [SHARED]: {},
  };

  const flat = flattenTalents(classTalents);
  flat.forEach((talent) => {
    const spell = talent.spell;

    const spellsTalent = {
      id: spell.id,
      name: spell.name,
      icon: spell.icon,
    };
    if (spell.powerCost) {
      const mana = spell.powerCost.match(/^([0-9.]+)% of base mana$/);
      if (mana) {
        spellsTalent.manaCost = Math.round(mana[1] / 100 * BASE_MANA[className]);
      }
      const pain = spell.powerCost.match(/^([0-9.]+) Pain/);
      if (pain) {
        spellsTalent.painCost = Number(pain[1]);
      }
      const maelstrom = spell.powerCost.match(/^([0-9.]+) Maelstrom/);
      if (maelstrom) {
        spellsTalent.maelstromCost = Number(maelstrom[1]);
      }
      const holyPower = spell.powerCost.match(/^([0-9.]+) Holy Power/);
      if (holyPower) {
        spellsTalent.maelstromCost = Number(holyPower[1]);
      }
      const rage = spell.powerCost.match(/^([0-9.]+) Rage/);
      if (rage) {
        spellsTalent.rageCost = Number(rage[1]);
      }
      const focus = spell.powerCost.match(/^([0-9.]+) Focus/);
      if (focus) {
        spellsTalent.focusCost = Number(focus[1]);
      }
      const energy = spell.powerCost.match(/^([0-9.]+) Energy/);
      if (energy) {
        spellsTalent.energyCost = Number(energy[1]);
      }
      const runicPower = spell.powerCost.match(/^([0-9.]+) Runic Power/);
      if (runicPower) {
        spellsTalent.runicPowerCost = Number(runicPower[1]);
      }
      const chi = spell.powerCost.match(/^([0-9.]+) Chi/);
      if (chi) {
        spellsTalent.chiCost = Number(chi[1]);
      }
      // TODO: As desired add other powers
    }

    const identifier = getIdentifier(spell);
    const category = getCategory(talent, spells);
    spells[category] = spells[category] || {};
    spells[category][identifier] = spellsTalent;
  });

  // If the talent already exists, another spec has a talent by the same name. Deduplicate talent names with shared names
  Object.keys(spells).forEach((specName) => {
    Object.keys(spells[specName]).forEach((spellKey) => {
      const talent = spells[specName][spellKey];

      const hasDuplicate = Object.values(spells).find((specTalents) => {
        return Object.keys(specTalents).find((key) => {
          const altTalent = specTalents[key];
          return key === spellKey && altTalent.id !== talent.id;
        });
      });

      if (hasDuplicate) {
        Object.keys(spells).forEach((duplicateSpecName) => {
          const duplicateSpecTalents = spells[duplicateSpecName];
          Object.keys(duplicateSpecTalents).forEach((key) => {
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

  const fileName = `${className}.js`;
  fs.writeFileSync(
    `${TALENTS_DIRECTORY}/${fileName}`,
    `// Generated file, changes will be overwritten!

export default {
${Object.keys(spells).map((specName) => {
  return `  // ${specName}
${Object.keys(spells[specName]).map((talentName) => {
  return `  ${talentName}: { ${Object.keys(spells[specName][talentName]).map(prop => `${prop}: ${JSON.stringify(spells[specName][talentName][prop])}`).join(', ')} },`;
}).join('\n')}`;
}).join('\n')}
};
`);
  console.log('Saving', fileName);
});
