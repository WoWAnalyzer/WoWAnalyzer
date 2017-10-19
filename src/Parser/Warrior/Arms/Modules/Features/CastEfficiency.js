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
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CLEAVE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 6,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE'
    },
    {
      spell: SPELLS.WHIRLWIND,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE'
    },
    {
      spell: SPELLS.WARBREAKER,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL_AOE,
      getCooldown: haste => 60,
      noSuggestion: true,
      noCanBeImproved: true,
      extraSuggestion: 'Only used in a combat with AoE'
    },
    {
      spell: SPELLS.BATTLE_CRY,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 60,
      noSuggestion: false,
    },
    {
      spell: SPELLS.CHARGE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 20,
      recommendedCastEfficiency: 0.1,
      noSuggestion: false,
    }
  ]
}

export default CastEfficiency;
