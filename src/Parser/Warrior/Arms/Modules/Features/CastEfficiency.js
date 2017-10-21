import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

// eslint-disable no-unused-vars

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.MORTAL_STRIKE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 6,
      noSuggestion: false,
    },
    {
      spell: SPELLS.COLOSSUS_SMASH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 20,
      noSuggestion: false,
    },
    {
      spell: SPELLS.EXECUTE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: false,
    },
    {
      spell: SPELLS.SLAM,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: false,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CLEAVE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 6,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE',
    },
    {
      spell: SPELLS.WHIRLWIND,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE after using Cleave to increase your Whirlwind Damage',
    },
    {
      spell: SPELLS.WARBREAKER,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE',
    },
    {
      spell: SPELLS.BATTLE_CRY,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      noSuggestion: false,
    },
    {
      spell: SPELLS.COMMANDING_SHOUT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: false,
      recommendedCastEfficiency: 0.01,
      noCanBeImproved: true,
      extraSuggestion: 'Use it to support your raid party.',
    },
    {
      spell: SPELLS.CHARGE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 17,
      noSuggestion: false,
      recommendedCastEfficiency: 0.01,
      noCanBeImproved: true,
      extraSuggestion: 'Use CHARGE to close the gap',
    },
    {
      spell: SPELLS.HEROIC_LEAP,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: false,
      recommendedCastEfficiency: 0.01,
      noCanBeImproved: true,
      extraSuggestion: 'Use HEROIC LEAP to close the gap',
    },
    {
      spell: SPELLS.PUMMEL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ]
}

export default CastEfficiency;
