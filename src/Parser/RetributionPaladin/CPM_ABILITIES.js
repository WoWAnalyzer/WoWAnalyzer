import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Spell',
  COOLDOWNS: 'Cooldown',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.CRUSADER_STRIKE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: (haste, combatant) => 4.5 / (1 + haste) - (combatant.hasTalent(SPELLS.THE_FIRES_OF_JUSTICE_TALENT.id) ? 1 : 0),
    charges: 2,
    isActive: combatant => !combatant.hasTalent(SPELLS.ZEAL_TALENT.id),
  },
  {
    spell: SPELLS.ZEAL_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 4.5 / (1 + haste),
    charges: 2,
    isActive: combatant => combatant.hasTalent(SPELLS.ZEAL_TALENT.id),
  },
  {
    spell: SPELLS.BLADE_OF_JUSTICE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 10.5 / (1 + haste),
    isActive: combatant => !combatant.hasTalent(SPELLS.DIVINE_HAMMER_TALENT.id),
  },
  {
    spell: SPELLS.DIVINE_HAMMER_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
    isActive: combatant => combatant.hasTalent(SPELLS.DIVINE_HAMMER_TALENT.id),
  },
  {
    spell: SPELLS.JUDGMENT_CAST,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
  },
  {
    spell: SPELLS.WAKE_OF_ASHES,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 30,
  },

  {
    spell: SPELLS.SHIELD_OF_VENGEANCE,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => 120 - (combatant.traitsBySpellId[SPELLS.DEFLECTION.id] || 0) * 10,
    recommendedCastEfficiency: 0.6,
  },
  {
    spell: SPELLS.ARCANE_TORRENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 90,
    hideWithZeroCasts: true,
  },

  {
    spell: SPELLS.AVENGING_WRATH,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
    isActive: combatant => combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
  },
  {
    spell: SPELLS.CRUSADE_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
    isActive: combatant => combatant.hasTalent(SPELLS.CRUSADE_TALENT.id),
  },
];

export default CPM_ABILITIES;
