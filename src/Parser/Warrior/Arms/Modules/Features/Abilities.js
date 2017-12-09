import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

// eslint-disable no-unused-vars

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,
    {
      spell: SPELLS.MORTAL_STRIKE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6,
      noSuggestion: false,
    },
    {
      spell: SPELLS.COLOSSUS_SMASH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      noSuggestion: false,
    },
    {
      spell: SPELLS.EXECUTE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: false,
    },
    {
      spell: SPELLS.SLAM,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: false,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CLEAVE,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 6,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE',
    },
    {
      spell: SPELLS.WHIRLWIND,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE after using Cleave to increase your Whirlwind Damage',
    },
    {
      spell: SPELLS.WARBREAKER,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE',
    },
    {
      spell: SPELLS.BATTLE_CRY,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      noSuggestion: false,
    },
    {
      spell: SPELLS.COMMANDING_SHOUT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: false,
      recommendedEfficiency: 0.01,
      noCanBeImproved: true,
      extraSuggestion: 'Use it to support your raid party.',
    },
    {
      spell: SPELLS.CHARGE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 17,
      noSuggestion: false,
      recommendedEfficiency: 0.01,
      noCanBeImproved: true,
      extraSuggestion: 'Use CHARGE to close the gap',
    },
    {
      spell: SPELLS.HEROIC_LEAP,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: false,
      recommendedEfficiency: 0.01,
      noCanBeImproved: true,
      extraSuggestion: 'Use HEROIC LEAP to close the gap',
    },
    {
      spell: SPELLS.PUMMEL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ]
}

export default Abilities;
