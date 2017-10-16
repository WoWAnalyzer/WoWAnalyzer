import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    // Rotational spells
    {
      spell: SPELLS.FIREBALL,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.PYROBLAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SCORCH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.PHOENIXS_FLAMES,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      recommendedCastEfficiency: 0.90,
      charges: 3,
    },
    {
      spell: SPELLS.FIRE_BLAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      recommendedCastEfficiency: 0.90,
      charges: 2,
      isActive: combatant => !combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) && !combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id),
    },
    {
      spell: SPELLS.FIRE_BLAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 10 / (1 + haste),
      recommendedCastEfficiency: 0.90,
      charges: 3,
      isActive: combatant => combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id),
    },
    {
      spell: SPELLS.METEOR_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      recommendedCastEfficiency: 0.90,
	    isActive: combatant => combatant.hasTalent(SPELLS.METEOR_TALENT.id),
    },
    {
      spell: SPELLS.DRAGONS_BREATH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 20,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FLAMESTRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.LIVING_BOMB_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 12 / (1 + haste),
	    isActive: combatant => combatant.hasTalent(SPELLS.LIVING_BOMB_TALENT.id),
    },
    {
      spell: SPELLS.CINDERSTORM_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 9 / (1 + haste),
	    isActive: combatant => combatant.hasTalent(SPELLS.CINDERSTORM_TALENT.id),
    },
    {
      spell: SPELLS.BLAST_WAVE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 25,
	    isActive: combatant => combatant.hasTalent(SPELLS.BLAST_WAVE_TALENT.id),
    },

    // Cooldowns
    {
      spell: SPELLS.COMBUSTION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
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
      spell: SPELLS.BLAZING_BARRIER,
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
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.FROST_NOVA,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.BLINK,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.SHIMMER_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      charges: 2,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.COUNTERSPELL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 24,
      noSuggestion: true,
      noCanBeImproved: true,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.SLOW_FALL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.SPELL_STEAL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.INVISIBILITY,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 300,
      noSuggestion: true,
      noCanBeImproved: true,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      hideWithZeroCasts: true,
    },
  ];
}

export default CastEfficiency;
