import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.MORTAL_STRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 6 / (1 + haste),
        gcd: true,
      },
      {
        spell: SPELLS.COLOSSUS_SMASH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: combatant.hasTalent(SPELLS.TITANIC_MIGHT_TALENT.id) ? 20 - 8 : 20,
        gcd: true,
      },
      {
        spell: SPELLS.EXECUTE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: true,
      },
      {
        spell: SPELLS.SLAM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: true,
      },
      {
        spell: SPELLS.REND_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: true,
        enabled: combatant.hasTalent(SPELLS.REND_TALENT.id),
      },
      {
        spell: SPELLS.CLEAVE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 6,
        gcd: true,
      },
      {
        spell: SPELLS.WHIRLWIND,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: true,
      },
      {
        spell: SPELLS.BLADESTORM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 90,
        gcd: true,
      },
      {
        spell: SPELLS.WARBREAKER,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 60,
        gcd: true,
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
