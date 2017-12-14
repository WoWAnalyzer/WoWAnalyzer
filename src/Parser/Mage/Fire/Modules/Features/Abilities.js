import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    // Rotational spells
    {
      spell: SPELLS.FIREBALL,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.PYROBLAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SCORCH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.PHOENIXS_FLAMES,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      recommendedEfficiency: 0.90,
      charges: 3,
    },
    {
      spell: SPELLS.FIRE_BLAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 12 / (1 + haste),
      recommendedEfficiency: 0.90,
      charges: 2,
      isActive: combatant => !combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) && !combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id),
    },
    {
      spell: SPELLS.FIRE_BLAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 10 / (1 + haste),
      recommendedEfficiency: 0.90,
      charges: 3,
      isActive: combatant => combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id),
    },
    {
      spell: SPELLS.METEOR_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 45,
      recommendedEfficiency: 0.90,
	    isActive: combatant => combatant.hasTalent(SPELLS.METEOR_TALENT.id),
    },
    {
      spell: SPELLS.DRAGONS_BREATH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 20,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FLAMESTRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.LIVING_BOMB_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 12 / (1 + haste),
	    isActive: combatant => combatant.hasTalent(SPELLS.LIVING_BOMB_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CINDERSTORM_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 9 / (1 + haste),
	    isActive: combatant => combatant.hasTalent(SPELLS.CINDERSTORM_TALENT.id),
    },
    {
      spell: SPELLS.BLAST_WAVE_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 25,
	    isActive: combatant => combatant.hasTalent(SPELLS.BLAST_WAVE_TALENT.id),
    },

    // Cooldowns
    {
      spell: SPELLS.COMBUSTION,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
    },
    {
      spell: SPELLS.MIRROR_IMAGE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
    },
    {
      spell: SPELLS.RUNE_OF_POWER_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 40,
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
    },

    //Defensives
    {
      spell: SPELLS.BLAZING_BARRIER,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 25,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ICE_BLOCK,
      category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      getCooldown: haste => 240,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    //Utility
    {
      spell: SPELLS.FROST_NOVA,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
    },
    {
      spell: SPELLS.FROST_NOVA,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
      charges: 2,
      isActive: combatant => combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
    },
    {
      spell: SPELLS.BLINK,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.SHIMMER_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      charges: 2,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
    },
    {
      spell: SPELLS.COUNTERSPELL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 24,
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
      getCooldown: haste => 300,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isUndetectable: true,
    },
  ];
}

export default Abilities;
