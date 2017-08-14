import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  ROTATIONAL_AOE: 'Rotational AoE Spell',
  DOTS: 'DoT Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.DRAIN_SOUL,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.LIFE_TAP,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => null,
    extraSuggestion: 'If you\'re using Empowered Life Tap, you should keep a very high uptime on the Empowered Life Tap buff.',
  },
  {
    spell: SPELLS.HAUNT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 25,
    isActive: combatant => combatant.hasTalent(SPELLS.HAUNT_TALENT.id),
  },
  {
    spell: SPELLS.PHANTOM_SINGULARITY,
    category: SPELL_CATEGORY.ROTATIONAL_AOE,
    getCooldown: haste => 40,
    isActive: combatant => combatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id),
  },
  {
    spell: SPELLS.SEED_OF_CORRUPTION_DEBUFF,
    category: SPELL_CATEGORY.ROTATIONAL_AOE,
    getCooldown: haste => null,
    isActive: combatant => combatant.hasTalent(SPELLS.SOW_THE_SEEDS_TALENT.id),
  },
  {
    spell: SPELLS.AGONY,
    category: SPELL_CATEGORY.DOTS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.CORRUPTION_CAST,
    category: SPELL_CATEGORY.DOTS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.SIPHON_LIFE,
    category: SPELL_CATEGORY.DOTS,
    getCooldown: haste => null,
    isActive: combatant => combatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id),
  },
  {
    spell: SPELLS.UNSTABLE_AFFLICTION_CAST,
    category: SPELL_CATEGORY.DOTS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.SOUL_HARVEST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
    isActive: combatant => combatant.hasTalent(SPELLS.SOUL_HARVEST_TALENT.id),
  },
  {
    spell: SPELLS.REAP_SOULS,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 5,
  },
  {
    spell: SPELLS.SUMMON_DOOMGUARD_UNTALENTED,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
  },
  {
    spell: SPELLS.SUMMON_INFERNAL_UNTALENTED,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => !combatant.hasTalent(SPELLS.GRIMOIRE_OF_SUPREMACY_TALENT.id),
  },
  //mely by tu byt asi i grimoire of service, ale jednak nevim jak to zapsat, jednak se ten talent nenosi
  {
    spell: SPELLS.UNENDING_RESOLVE,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => 180,
  },
  {
    spell: SPELLS.DARK_PACT,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => 60,
    isActive: combatant => combatant.hasTalent(ITEMS.DARK_PACT_TALENT.id),
  },
  {
    spell: SPELLS.MORTAL_COIL,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => 45,
    isActive: combatant => combatant.hasTalent(SPELLS.MORTAL_COIL_TALENT.id),
  },
  {
    spell: SPELLS.BURNING_RUSH,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    isActive: combatant => combatant.hasTalent(SPELLS.BURNING_RUSH_TALENT.id),
  },
];

export default CPM_ABILITIES;
