import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  ROTATIONAL_AOE: 'Spell (AOE)',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.ASCENDANCE_TALENT_ENHANCEMENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ENHANCEMENT.id),
    recommendedCastEfficiency: 1.0,
  },
  {
    spell: SPELLS.DOOM_WINDS,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
  },
  {
    spell: SPELLS.FERAL_SPIRIT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
  },
  {
    spell: SPELLS.LIGHTNING_BOLT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.ROCKBITER,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.FROSTBRAND,
    category: SPELL_CATEGORY.ROTATIONAL,
    isActive: combatant => combatant.hasTalent(SPELLS.FROSTBRAND.id),
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.FLAMETONGUE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.STORMSTRIKE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.LAVA_LASH,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.WINDSTRIKE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.CRASH_LIGHTNING,
    category: SPELL_CATEGORY.ROTATIONAL_AOE,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
  {
    spell: SPELLS.EARTHEN_SPIKE,
    category: SPELL_CATEGORY.ROTATIONAL,
    isActive: combatant => combatant.hasTalent(SPELLS.EARTHEN_SPIKE_TALENT.id),
    getCooldown: haste => 20, // 1.5 / (1 + haste)
    recommendedCastEfficiency: .3,
  },
  {
    spell: SPELLS.HEALING_SURGE_ENHANCE,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null, // 1.5 / (1 + haste)
  },
];

export default CPM_ABILITIES;
