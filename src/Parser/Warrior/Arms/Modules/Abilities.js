import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      {
        spell: SPELLS.MORTAL_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        isOnGCD: true,
      },
      {
        spell: SPELLS.COLOSSUS_SMASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: combatant.hasTalent(SPELLS.TITANIC_MIGHT_TALENT.id) ? 20 - 8 : 20,
        isOnGCD: true,
      },
      {
        spell: SPELLS.EXECUTE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SLAM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.REND_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.REND_TALENT.id),
      },
      {
        spell: SPELLS.CLEAVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 6,
        isOnGCD: true,
      },
      {
        spell: SPELLS.WHIRLWIND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BLADESTORM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 90,
        isOnGCD: true,
      },
      {
        spell: SPELLS.WARBREAKER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 60,
        isOnGCD: true,
      },
      {
        spell: SPELLS.BATTLE_CRY,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.COMMANDING_SHOUT,
        buffSpellId: SPELLS.COMMANDING_SHOUT_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion: 'Use it preemptively as a buffer against large AOE, or reactively if you notice your raid is getting dangerously low on health.',
        },
      },
      {
        spell: SPELLS.CHARGE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 20 - 3 : 20,
        charges: combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 2 : 1,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion: 'Use it to get back into range after moving out to avoid mechanics. Not only does this allow you to get back to DPSing faster, it also generates rage for you to DPS with.',
        },
      },
      {
        spell: SPELLS.HEROIC_LEAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion: 'Use it to escape mechanics at the last moment, allowing you more time to DPS.',
        },
      },
      {
        spell: SPELLS.PUMMEL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.DIE_BY_THE_SWORD,
        buffSpellId: SPELLS.DIE_BY_THE_SWORD.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: SPELLS.DEFENSIVE_STANCE_TALENT,
        buffSpellId: SPELLS.DEFENSIVE_STANCE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 6,
      },
    ];
  }
}

export default Abilities;
