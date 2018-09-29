import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.ENVENOM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.GARROTE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        // During the Subterfuge buff (from the talent), the spell has no cd
        cooldown: () => combatant.hasBuff(SPELLS.SUBTERFUGE_TALENT.id) ? 0 : 6,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.MUTILATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.POISONED_KNIFE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RUPTURE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.BLINDSIDE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.MARKED_FOR_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.CRIMSON_TEMPEST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.CRIMSON_TEMPEST_TALENT.id),
      },
      // Rotational AOE
      {
        spell: SPELLS.FAN_OF_KNIVES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.VENDETTA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.VANISH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.TOXIC_BLADE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 25,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.TOXIC_BLADE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Use on cooldown, or delay for Vendetta if less then 10 seconds remain.',
        },
      },
      {
        spell: SPELLS.EXSANGUINATE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.EXSANGUINATE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
          extraSuggestion: 'Use on cooldown, or delay for Vendetta if less then 10 seconds remain.',
        },
      },
      // Defensive
      {
        spell: SPELLS.CLOAK_OF_SHADOWS,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.CRIMSON_VIAL,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.EVASION,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.EVASION.id,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.FEINT,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.FEINT.id,
        cooldown: 15,
        gcd: {
          static: 1000,
        },
      },
      // Others
      {
        spell: SPELLS.DEADLY_POISON,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.WOUND_POISON,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.CRIPPLING_POISON,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      // Utility
      {
        spell: SPELLS.SHADOWSTEP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.SPRINT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: SPELLS.TRICKS_OF_THE_TRADE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.STEALTH,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 2,
        gcd: null,
      },
      {
        spell: SPELLS.BLIND,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.CHEAP_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.DISTRACT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.KICK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.KIDNEY_SHOT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SHROUD_OF_CONCEALMENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6 * 60,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.PICK_LOCK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.PICK_POCKET,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        // While this actually has a 0.5s CD, it shows up weird in the Abilities tab if we set that
      },
    ];
  }
}

export default Abilities;
