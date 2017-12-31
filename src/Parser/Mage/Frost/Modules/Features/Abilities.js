import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // Rotational spells
    {
      spell: SPELLS.FROSTBOLT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EBONBOLT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45 + (3 / (1+haste)), // 45 Second Cooldown with a 3 Second Cast time (Reduced by Haste). Temp until CastEfficiency gets a redo
      recommendedEfficiency: 0.90,
    },
    {
      spell: SPELLS.FLURRY,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ICE_LANCE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.CONE_OF_COLD,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.WATER_JET,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 25,
	    isActive: combatant => !combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id),
    },
    {
      spell: SPELLS.GLACIAL_SPIKE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
	    isActive: combatant => combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id),
    },
    {
      spell: SPELLS.COMET_STORM_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 30,
      recommendedEfficiency: 0.90,
	    isActive: combatant => combatant.hasTalent(SPELLS.COMET_STORM_TALENT.id),
    },
    {
      spell: SPELLS.ICE_NOVA_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 25,
      recommendedEfficiency: 0.90,
	    isActive: combatant => combatant.hasTalent(SPELLS.ICE_NOVA_TALENT.id),
    },
    {
      spell: SPELLS.BLIZZARD,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.RAY_OF_FROST_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.RAY_OF_FROST_TALENT.id),
    },

    // Cooldowns

    {
      spell: SPELLS.FROZEN_ORB,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      recommendedEfficiency: 0.90,
    },
    {
      spell: SPELLS.ICY_VEINS,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      recommendedEfficiency: 0.90,
    },
    {
      spell: SPELLS.MIRROR_IMAGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      recommendedEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
    },
    {
      spell: SPELLS.RUNE_OF_POWER_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 40,
      charges: 2,
      recommendedEfficiency: 0.90,
      isActive: combatant => combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
    },

    //Defensives
    {
      spell: SPELLS.ICE_BARRIER,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ICE_BLOCK,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => null,
    },

    //Utility
    {
      spell: SPELLS.FROST_NOVA,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.BLINK,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.SHIMMER_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      charges: 2,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.COUNTERSPELL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SLOW_FALL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SPELL_STEAL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.INVISIBILITY,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.COLD_SNAP,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SUMMON_WATER_ELEMENTAL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id),
    },
  ];
}

export default Abilities;
