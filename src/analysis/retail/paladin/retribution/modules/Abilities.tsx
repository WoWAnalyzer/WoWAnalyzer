import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TALENTS from 'common/TALENTS/paladin';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.WAKE_OF_ASHES_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
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
        spell: TALENTS.CRUSADE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: TALENTS.CRUSADE_TALENT.id,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.CRUSADE_TALENT),
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
        cooldown: 60,
        enabled:
          (combatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT) ||
            combatant.hasTalent(TALENTS.AVENGING_WRATH_MIGHT_TALENT)) &&
          !combatant.hasTalent(TALENTS.CRUSADE_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion:
            'This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.',
        },
      },
      {
        spell: TALENTS.FINAL_RECKONING_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.FINAL_RECKONING_TALENT),
        castEfficiency: {
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.EXECUTION_SENTENCE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.EXECUTION_SENTENCE_TALENT),
        castEfficiency: {
          recommendedEfficiency: 0.9,
        },
        gcd: {
          base: 750,
        },
      },
      {
        spell: TALENTS.DIVINE_TOLL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT),
        castEfficiency: {
          recommendedEfficiency: 0.9,
        },
      },

      {
        spell: SPELLS.CRUSADER_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: 2,
        cooldown: (haste: number) => 6 / (1 + haste),
        enabled:
          !combatant.hasTalent(TALENTS.CRUSADING_STRIKES_TALENT) &&
          !combatant.hasTalent(TALENTS.TEMPLAR_STRIKES_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CRUSADING_STRIKES.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.CRUSADING_STRIKES_TALENT),
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.TEMPLAR_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.TEMPLAR_STRIKES_TALENT),
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.TEMPLAR_SLASH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.TEMPLAR_STRIKES_TALENT),
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: TALENTS.HAMMER_OF_WRATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 7.5 / (1 + haste),
        enabled: combatant.hasTalent(TALENTS.HAMMER_OF_WRATH_TALENT),
        charges: 1 + combatant.getTalentRank(TALENTS.VANGUARDS_MOMENTUM_RETRIBUTION_TALENT),
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
        cooldown: (haste: number) =>
          (12 -
            combatant.getTalentRank(TALENTS.SEAL_OF_ALACRITY_TALENT) * 0.5 -
            combatant.getTalentRank(TALENTS.SWIFT_JUSTICE_TALENT) * 2.0) /
          (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.BLADE_OF_JUSTICE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 12 / (1 + haste),
        charges: combatant.hasTalent(TALENTS.IMPROVED_BLADE_OF_JUSTICE_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.75,
        },
      },
      {
        spell: TALENTS.FINAL_VERDICT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.FINAL_VERDICT_TALENT),
      },
      {
        spell: TALENTS.JUSTICARS_VENGEANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.JUSTICARS_VENGEANCE_TALENT),
      },
      {
        spell: TALENTS.DIVINE_STORM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.EXECUTION_SENTENCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.EXECUTION_SENTENCE_TALENT),
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
        spell: TALENTS.SHIELD_OF_VENGEANCE_TALENT.id,
        buffSpellId: SPELLS.SHIELD_OF_VENGEANCE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT) ? 60 : 90,
        gcd: {
          base: 750,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.5,
          importance: ISSUE_IMPORTANCE.MINOR,
        },
      },
      {
        spell: SPELLS.WORD_OF_GLORY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLINDING_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLINDING_LIGHT_TALENT),
      },
      {
        spell: TALENTS.REPENTANCE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.REPENTANCE_TALENT),
      },
      {
        spell: TALENTS.DIVINE_STEED_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS.CAVALIER_TALENT) ? 2 : 1,
        cooldown: 45,
        gcd: null,
      },
      {
        spell: SPELLS.LAY_ON_HANDS.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT) ? 420 : 600,
        castEfficiency: {
          recommendedEfficiency: 0.1,
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
        spell: TALENTS.REBUKE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
      },
      {
        spell: SPELLS.DIVINE_SHIELD.id,
        buffSpellId: SPELLS.DIVINE_SHIELD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT) ? 210 : 300,
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
        spell: TALENTS.CLEANSE_TOXINS_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TURN_EVIL_TALENT.id,
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
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
        category: SPELL_CATEGORY.UTILITY,
      },

      // Blessings
      {
        spell: TALENTS.BLESSING_OF_FREEDOM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLESSING_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
      },
      {
        spell: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        buffSpellId: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 300,
        gcd: {
          base: 1500,
        },
      },

      // Auras
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
    ];
  }
}

export default Abilities;
