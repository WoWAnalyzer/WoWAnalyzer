import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    // Rotational spells
    {
      spell: SPELLS.FROSTBOLT_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.EBONBOLT_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      recommendedCastEfficiency: 0.90,
    },
    {
      spell: SPELLS.FLURRY_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ICE_LANCE_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.FROZEN_ORB_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
	  recommendedCastEfficiency: 0.95,
    },
    {
      spell: SPELLS.GLACIAL_SPIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
	  isActive: combatant => combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id),
    },
    {
      spell: SPELLS.COMET_STORM_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
	  isActive: combatant => combatant.hasTalent(SPELLS.COMET_STORM_TALENT.id),
    },
    {
      spell: SPELLS.BLIZZARD_CAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
	  noSuggestion: true,
	  noCanBeImproved: true,
    },
    {
      spell: SPELLS.RAY_OF_FROST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.RAY_OF_FROST_TALENT.id),
    },

    // Cooldowns

    {
      spell: SPELLS.ICY_VEINS,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MIRROR_IMAGE,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
    },
    {
      spell: SPELLS.RUNE_OF_POWER,
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
  ];
}

export default CastEfficiency;
