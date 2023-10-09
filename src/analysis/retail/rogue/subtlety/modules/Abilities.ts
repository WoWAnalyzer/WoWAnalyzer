import SPELLS from 'common/SPELLS/rogue';
import TALENTS from 'common/TALENTS/rogue';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.BACKSTAB.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        enabled: !combatant.hasTalent(TALENTS.GLOOMBLADE_TALENT),
      },
      {
        spell: TALENTS.GLOOMBLADE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
        enabled: combatant.hasTalent(TALENTS.GLOOMBLADE_TALENT),
      },
      {
        spell: SPELLS.EVISCERATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.BLACK_POWDER.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SLICE_AND_DICE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        // Requires Stealth
        spell: SPELLS.SHADOWSTRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SHURIKEN_TOSS.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SYMBOLS_OF_DEATH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        buffSpellId: SPELLS.SYMBOLS_OF_DEATH.id,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion:
            'This is the most important rotational ability, try to always use it on cooldown.',
        },
      },
      // Rotational AOE
      {
        spell: SPELLS.SHURIKEN_STORM.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SHURIKEN_STORM_CP.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: null,
      },
      // Cooldowns
      {
        spell: TALENTS.SHADOW_BLADES_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: TALENTS.SHADOW_BLADES_TALENT.id,
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
        spell: TALENTS.SEPSIS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.SEPSIS_TALENT),
        cooldown: 90,
        gcd: {
          base: 1000,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.SHADOW_DANCE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: SPELLS.SHADOW_DANCE_BUFF.id,
        cooldown: 60,
        charges: 1 + (combatant.hasTalent(TALENTS.SHADOW_DANCE_TALENT) ? 1 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          extraSuggestion: 'Use Shadow Dance before it reaches maximum charges.',
        },
      },
      {
        spell: SPELLS.VANISH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: SPELLS.VANISH_BUFF.id,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: TALENTS.SECRET_TECHNIQUE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.SECRET_TECHNIQUE_TALENT),
      },
      {
        spell: TALENTS.SHURIKEN_TORNADO_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          static: 1000,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.SHURIKEN_TORNADO_TALENT),
      },
      // Defensive
      {
        spell: TALENTS.CLOAK_OF_SHADOWS_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: TALENTS.CLOAK_OF_SHADOWS_TALENT.id,
        cooldown: 120,
        gcd: null,
      },
      {
        spell: SPELLS.CRIMSON_VIAL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: TALENTS.EVASION_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: TALENTS.EVASION_TALENT.id,
        cooldown: 120,
      },
      {
        spell: SPELLS.FEINT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.FEINT.id,
        cooldown: 15,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.RUPTURE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          static: 1000,
        },
      },
      // Utility
      {
        spell: SPELLS.SHADOW_STEP.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        charges: combatant.hasTalent(TALENTS.SHADOWSTEP_TALENT) ? 2 : 1,
        gcd: null,
      },
      {
        spell: SPELLS.SPRINT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: TALENTS.TRICKS_OF_THE_TRADE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: SPELLS.STEALTH.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 2,
        gcd: null,
      },
      {
        spell: TALENTS.BLIND_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.CHEAP_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.DISTRACT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.KICK.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.KIDNEY_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20,
        gcd: {
          static: 1000,
        },
      },
      {
        spell: SPELLS.SHROUD_OF_CONCEALMENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 6 * 60,
        gcd: {
          base: 1000,
        },
      },
      {
        spell: SPELLS.SAP.id,
        category: SPELL_CATEGORY.UTILITY,
      },
      {
        spell: SPELLS.PICK_LOCK.id,
        category: SPELL_CATEGORY.UTILITY,
      },
      {
        spell: SPELLS.PICK_POCKET.id,
        category: SPELL_CATEGORY.UTILITY,
        // While this actually has a 0.5s CD, it shows up weird in the Abilities tab if we set that
      },
      {
        spell: TALENTS.PREMEDITATION_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
      },
    ];
  }
}

export default Abilities;
