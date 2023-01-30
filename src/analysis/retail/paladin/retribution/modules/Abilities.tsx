import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_PALADIN } from 'common/TALENTS';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.WAKE_OF_ASHES.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
          extraSuggestion:
            'It has a high damage per execute time and generates a lot of Holy Power. Only hold the ability if adds are coming out in 15 seconds or less.',
        },
      },
      {
        spell: SPELLS.CRUSADE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: SPELLS.CRUSADE_TALENT.id,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.CRUSADE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion:
            'This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.',
        },
      },
      {
        spell: SPELLS.AVENGING_WRATH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: SPELLS.AVENGING_WRATH.id,
        cooldown: 120,
        enabled: !combatant.hasTalent(SPELLS.CRUSADE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion:
            'This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.',
        },
      },
      {
        spell: SPELLS.CRUSADER_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: 2,
        cooldown: (haste: number) =>
          (6 / (1 + haste)) *
          (1 - (combatant.hasTalent(SPELLS.FIRES_OF_JUSTICE_TALENT) ? 0.85 : 0)),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_WRATH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 7.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 12 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.BLADE_OF_JUSTICE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 12 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
        },
      },
      {
        spell: SPELLS.TEMPLARS_VERDICT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DIVINE_STORM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EXECUTION_SENTENCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EXECUTION_SENTENCE_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CONSECRATION_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 9,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.25,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      //Utility
      {
        spell: SPELLS.SHIELD_OF_VENGEANCE.id,
        buffSpellId: SPELLS.SHIELD_OF_VENGEANCE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT) ? 84 : 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.JUSTICARS_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.JUSTICARS_TALENT),
      },
      {
        spell: SPELLS.EYE_FOR_AN_EYE_TALENT.id,
        buffSpellId: SPELLS.EYE_FOR_AN_EYE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.EYE_FOR_AN_EYE_TALENT),
      },
      {
        spell: SPELLS.WORD_OF_GLORY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLINDING_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.BLINDING_LIGHT_TALENT),
      },
      {
        spell: SPELLS.REPENTANCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.REPENTANCE_TALENT),
      },
      {
        spell: SPELLS.DIVINE_STEED.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(SPELLS.CAVALIER_TALENT) ? 2 : 1,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LAY_ON_HANDS.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT) ? 420 : 600,
        castEfficiency: {
          recommendedEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.BLESSING_OF_FREEDOM.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLESSING_OF_PROTECTION.id,
        buffSpellId: SPELLS.BLESSING_OF_PROTECTION.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_JUSTICE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAND_OF_RECKONING.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.REBUKE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.SERAPHIM_TALENT.id,
        buffSpellId: SPELLS.SERAPHIM_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SERAPHIM_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIVINE_SHIELD.id,
        buffSpellId: SPELLS.DIVINE_SHIELD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT) ? 210 : 300,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT.id,
        category: SPELL_CATEGORY.UTILITY,
        channel: (haste: number) => 1.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_PALADIN.BLESSING_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
      },
      {
        spell: SPELLS.CLEANSE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CRUSADER_AURA.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RETRIBUTION_AURA.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CONCENTRATION_AURA.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEVOTION_AURA.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TURN_EVIL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        channel: (haste: number) => 1.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SENSE_UNDEAD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAND_OF_HINDRANCE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1,
      },
    ];
  }
}

export default Abilities;
