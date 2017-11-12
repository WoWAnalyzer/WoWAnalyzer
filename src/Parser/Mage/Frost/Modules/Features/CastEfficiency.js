import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    // Rotational spells
    {
      spell: SPELLS.FROSTBOLT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EBONBOLT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45 + (3 / (1+haste)), // 45 Second Cooldown with a 3 Second Cast time (Reduced by Haste). Temp until CastEfficiency gets a redo
      recommendedCastEfficiency: 0.90,
    },
    {
      spell: SPELLS.FLURRY,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CONE_OF_COLD,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ICE_LANCE_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.WATER_JET,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 25,
	    isActive: combatant => !combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id),
    },
    {
      spell: SPELLS.GLACIAL_SPIKE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
	    isActive: combatant => combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id),
    },
    {
      spell: SPELLS.COMET_STORM_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
	    isActive: combatant => combatant.hasTalent(SPELLS.COMET_STORM_TALENT.id),
    },
    {
      spell: SPELLS.BLIZZARD,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.RAY_OF_FROST_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.RAY_OF_FROST_TALENT.id),
    },

    // Cooldowns

    {
      spell: SPELLS.FROZEN_ORB,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
	    recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.ICY_VEINS,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MIRROR_IMAGE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
    },
    {
      spell: SPELLS.RUNE_OF_POWER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 40,
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
    },

    //Defensives
    {
      spell: SPELLS.ICE_BARRIER,
      category: CastEfficiency.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 25,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ICE_BLOCK,
      category: CastEfficiency.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 240,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    //Utility
    {
      spell: SPELLS.FROST_NOVA,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLINK,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.SHIMMER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      charges: 2,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.COUNTERSPELL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SLOW_FALL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SPELL_STEAL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.INVISIBILITY,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.COLD_SNAP,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_WATER_ELEMENTAL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id),
    },
  ];
}

export default CastEfficiency;
