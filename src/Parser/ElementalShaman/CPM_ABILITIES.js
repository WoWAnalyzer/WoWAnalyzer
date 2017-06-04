import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Spell',
  ROTATIONAL_AOE: 'Spell (AOE)',
  DOTS: 'Dot',
  COOLDOWNS: 'Cooldown',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.LAVA_BURST,
    charges: 2,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // haste => 8 / (1 + haste)
    // TODO: Add Cooldown with stacks and Lava Surge procs
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.LIQUID_MAGMA_TOTEM,
    category: SPELL_CATEGORY.ROTATIONAL_AOE,
    isActive: combatant => combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM.id),
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.CHAIN_LIGHTNING,
    category: SPELL_CATEGORY.ROTATIONAL_AOE,
    getCooldown: haste => null, // 2 / (1 + haste)
  },
  {
    spell: SPELLS.EARTHQUAKE,
    category: SPELL_CATEGORY.ROTATIONAL_AOE,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.ELEMENTAL_BLAST,
    category: SPELL_CATEGORY.ROTATIONAL,
    isActive: combatant => combatant.hasTalent(SPELLS.ELEMENTAL_BLAST.id),
    getCooldown: haste => 12,
    recommendedCastEfficiency: 0.6,
  },
  {
    spell: SPELLS.ASCENDANCE,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE.id),
    recommendedCastEfficiency: 1.0,
  },
  {
    spell: SPELLS.STORMKEEPER,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
  },
  {
    spell: SPELLS.FIRE_ELEMENTAL,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60 * 5, // TODO: Add Elementalist -> Lava Burst cast ^= -2 sec cd
    recommendedCastEfficiency: 1.0,
  },
  {
    spell: SPELLS.FLAME_SHOCK,
    category: SPELL_CATEGORY.DOTS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.FROST_SHOCK,
    category: SPELL_CATEGORY.DOTS,
    getCooldown: haste => null,
  },
];

export default CPM_ABILITIES;
