import SPELLS from 'common/SPELLS';
import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.BACKSTAB,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        enabled: !combatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id),
      },
      {
        spell: SPELLS.GLOOMBLADE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(SPELLS.GLOOMBLADE_TALENT.id),
      },
      {
        spell: SPELLS.EVISCERATE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        // Requires Stealth
        spell: SPELLS.SHADOWSTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        buffSpellId: SPELLS.FIND_WEAKNESS_BUFF.id,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SHURIKEN_TOSS,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SYMBOLS_OF_DEATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        buffSpellId: SPELLS.SYMBOLS_OF_DEATH.id,
        cooldown: 30 - (combatant.hasBuff(SPELLS.SUB_ROGUE_T20_4SET_BONUS.id) ? 5 : 0),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'This is the most important rotational ability, try to always use it on cooldown.',
        },
      },
      // Rotational AOE
      {
        spell: SPELLS.SHURIKEN_STORM,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
      },
      // Cooldowns
      {
        spell: SPELLS.SHADOW_BLADES,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        buffSpellId: SPELLS.SHADOW_BLADES.id,
        cooldown: 180,
        gcd: {
          base: 1000,
        },
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'In most cases should be used on cooldown.',
        },
      },
      {
        spell: SPELLS.SHADOW_DANCE,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        buffSpellId: SPELLS.SHADOW_DANCE_BUFF.id,
        cooldown: 60,
        charges: 2 + (combatant.hasTalent(SPELLS.ENVELOPING_SHADOWS_TALENT.id) ? 1 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'Use Shadow Dance before it reaches maximum charges.',
        },
      },
      {
        spell: SPELLS.VANISH,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        buffSpellId: SPELLS.VANISH_BUFF.id,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.MARKED_FOR_DEATH_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.MARKED_FOR_DEATH_TALENT.id),
      },
      {
        spell: SPELLS.SECRET_TECHNIQUE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 45,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(SPELLS.SECRET_TECHNIQUE_TALENT.id),
      },
      {
        spell: SPELLS.SHURIKEN_TORNADO_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(SPELLS.SHURIKEN_TORNADO_TALENT.id),
      },
      // Defensive
      {
        spell: SPELLS.CLOAK_OF_SHADOWS,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        buffSpellId: SPELLS.CLOAK_OF_SHADOWS.id,
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
      {
        spell: SPELLS.NIGHTBLADE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      // Utility
      {
        spell: SPELLS.SHADOWSTEP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        charges: 2,
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
        buffSpellId: SPELLS.FIND_WEAKNESS_BUFF.id,
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
