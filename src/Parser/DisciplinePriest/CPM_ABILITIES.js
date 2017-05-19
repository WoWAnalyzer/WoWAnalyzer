import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  OTHERS: 'Spell',
  UTILITY: 'Utility',
};

const CPM_ABILITIES = [
  {
    spell: SPELLS.PENANCE,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCasts: (_, parser) => parser.modules.alwaysBeCasting.truePenanceCasts,
    getCooldown: haste => 9,
  },
  {
    spell: SPELLS.POWER_WORD_SHIELD,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 9 / (1 + haste),
  },
  {
    spell: SPELLS.SCHISM_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 6,
    isActive: combatant => combatant.hasTalent(SPELLS.SCHISM_TALENT.id),
  },
  {
    spell: SPELLS.POWER_WORD_SOLACE_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 12 / (1 + haste),
    isActive: combatant => combatant.hasTalent(SPELLS.POWER_WORD_SOLACE_TALENT.id),
  },
  {
    spell: SPELLS.DIVINE_STAR_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 15,
    isActive: combatant => combatant.hasTalent(SPELLS.DIVINE_STAR_TALENT.id),
  },
  {
    spell: SPELLS.HALO_TALENT,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 40,
    isActive: combatant => combatant.hasTalent(SPELLS.HALO_TALENT.id),
  },
  {
    spell: SPELLS.LIGHTS_WRATH,
    category: SPELL_CATEGORY.ROTATIONAL,
    getCooldown: haste => 90,
  },

  {
    spell: SPELLS.MINDBENDER_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 60,
    isActive: combatant => combatant.hasTalent(SPELLS.MINDBENDER_TALENT.id),
  },
  {
    spell: SPELLS.SHADOWFIEND,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 180,
    isActive: combatant => combatant.hasTalent(SPELLS.MINDBENDER_TALENT.id),
  },
  {
    spell: SPELLS.RAPTURE,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
  },
  {
    spell: SPELLS.POWER_INFUSION_TALENT,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 120,
    isActive: combatant => combatant.hasTalent(SPELLS.POWER_INFUSION_TALENT.id),
  },
  {
    spell: SPELLS.PAIN_SUPPRESSION,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: (haste, combatant) => 4 * 60 - (combatant.traitsBySpellId[SPELLS.PAIN_IS_IN_YOUR_MIND.id] || 0) * 10,
  },
  {
    spell: SPELLS.POWER_WORD_BARRIER_CAST,
    category: SPELL_CATEGORY.COOLDOWNS,
    getCooldown: haste => 3 * 60,
  },

  {
    spell: SPELLS.POWER_WORD_RADIANCE,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.SHADOW_WORD_PAIN,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    isActive: combatant => !combatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id),
  },
  {
    spell: SPELLS.PURGE_THE_WICKED_TALENT,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    isActive: combatant => combatant.hasTalent(SPELLS.PURGE_THE_WICKED_TALENT.id),
  },
  {
    spell: SPELLS.SHADOW_COVENANT_TALENT,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    isActive: combatant => combatant.hasTalent(SPELLS.SHADOW_COVENANT_TALENT.id),
  },
  {
    spell: SPELLS.CLARITY_OF_WILL_TALENT,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
    isActive: combatant => combatant.hasTalent(SPELLS.CLARITY_OF_WILL_TALENT.id),
  },
  {
    spell: SPELLS.PLEA,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },
  {
    spell: SPELLS.SMITE,
    category: SPELL_CATEGORY.OTHERS,
    getCooldown: haste => null,
  },

  {
    spell: SPELLS.ANGELIC_FEATHER_TALENT,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 20,
    isActive: combatant => combatant.hasTalent(SPELLS.ANGELIC_FEATHER_TALENT.id),
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.SHINING_FORCE_TALENT,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 45,
    isActive: combatant => combatant.hasTalent(SPELLS.SHINING_FORCE_TALENT.id),
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.FADE,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 30,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.LEAP_OF_FAITH,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 150,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.MIND_CONTROL,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: (haste, selectedCombatant) => (selectedCombatant.hasTalent(SPELLS.DOMINANT_MIND_TALENT.id) ? 120 : 0),
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.MASS_DISPEL,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 15,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.DISPEL_MAGIC,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => null,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.PURIFY,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => 8,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.SHACKLE_UNDEAD,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: haste => null,
    noSuggestion: true,
    noCanBeImproved: true,
  },
  {
    spell: SPELLS.PSYCHIC_SCREAM,
    category: SPELL_CATEGORY.UTILITY,
    getCooldown: (haste, selectedCombatant) => 60 - (selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 0),
    noSuggestion: true,
    noCanBeImproved: true,
  },
];

export default CPM_ABILITIES;
