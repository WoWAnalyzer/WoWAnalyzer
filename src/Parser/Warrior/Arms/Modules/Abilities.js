import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() { // TODO: Migrate
    return [
      {
        spell: SPELLS.MORTAL_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.COLOSSUS_SMASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 20,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.EXECUTE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.SLAM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.CLEAVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 6,
      },
      {
        spell: SPELLS.WHIRLWIND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.WARBREAKER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 60,
      },
      {
        spell: SPELLS.BATTLE_CRY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.COMMANDING_SHOUT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion: 'Use it to support your raid party.',
        },
      },
      {
        spell: SPELLS.CHARGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 17,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion: 'Use CHARGE to close the gap',
        },
      },
      {
        spell: SPELLS.HEROIC_LEAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion: 'Use HEROIC LEAP to close the gap',
        },
      },
      {
        spell: SPELLS.PUMMEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
    ];
  }
}

export default Abilities;
