import SPELLS from 'common/SPELLS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TALENTS, { TALENTS_PALADIN } from 'common/TALENTS/paladin';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.WAKE_OF_ASHES_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.WAKE_OF_ASHES_TALENT),
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
        spell: SPELLS.CRUSADING_STRIKES.id,
        enabled: combatant.hasTalent(TALENTS.CRUSADING_STRIKES_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.DIVINE_HAMMER_CAST.id,
        enabled: combatant.hasTalent(TALENTS.DIVINE_HAMMER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: TALENTS_PALADIN.DIVINE_HAMMER_TALENT.id,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CRUSADE.id,
        enabled:
          combatant.hasTalent(TALENTS.CRUSADE_TALENT) &&
          !combatant.hasTalent(TALENTS.RADIANT_GLORY_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: SPELLS.CRUSADE.id,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion:
            'This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.',
        },
      },
      {
        spell: TALENTS.AVENGING_WRATH_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT) &&
          !combatant.hasTalent(TALENTS.RADIANT_GLORY_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        buffSpellId: TALENTS.AVENGING_WRATH_TALENT.id,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          importance: ISSUE_IMPORTANCE.MAJOR,
          extraSuggestion:
            'This is our only cooldown and where most of our damage comes from. You really want to not lose a cast of this over a fight.',
        },
      },
      {
        spell: TALENTS.EXECUTION_SENTENCE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EXECUTION_SENTENCE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          recommendedEfficiency: 0.9,
        },
        gcd: {
          base: 750,
        },
      },
      {
        spell: TALENTS.DIVINE_TOLL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        castEfficiency: {
          recommendedEfficiency: 0.9,
        },
        gcd: {
          base: 1500,
        },
      },

      {
        spell: SPELLS.CRUSADER_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        charges: 2,
        cooldown: (haste: number) =>
          (6 - combatant.getTalentRank(TALENTS.SWIFT_JUSTICE_TALENT) * 2.0) / (1 + haste),
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
        spell: SPELLS.HAMMER_OF_LIGHT.id,
        enabled: combatant.hasTalent(TALENTS.LIGHTS_GUIDANCE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TEMPLAR_STRIKE.id,
        enabled: combatant.hasTalent(TALENTS.TEMPLAR_STRIKES_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.TEMPLAR_SLASH.id,
        enabled: combatant.hasTalent(TALENTS.TEMPLAR_STRIKES_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) =>
          (12 - combatant.getTalentRank(TALENTS.SWIFT_JUSTICE_TALENT) * 2.0) / (1 + haste),
        charges: combatant.hasTalent(TALENTS.IMPROVED_JUDGMENT_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.BLADE_OF_JUSTICE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLADE_OF_JUSTICE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) =>
          (12 - combatant.getTalentRank(TALENTS.LIGHT_OF_JUSTICE_TALENT) * 2.0) / (1 + haste),
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
        enabled: combatant.hasTalent(TALENTS.FINAL_VERDICT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DIVINE_STORM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DIVINE_STORM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },

      //Utility
      {
        spell: SPELLS.WORD_OF_GLORY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLINDING_LIGHT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLINDING_LIGHT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.LIGHTS_COUNTENANCE_TALENT) ? 75 : 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DIVINE_STEED_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        charges: combatant.hasTalent(TALENTS.CAVALIER_TALENT) ? 2 : 1,
        cooldown: combatant.hasTalent(TALENTS.DIVINE_SPURS_TALENT) ? 36 : 45,
        gcd: null,
      },
      {
        spell: TALENTS.LAY_ON_HANDS_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.LAY_ON_HANDS_TALENT),
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
        cooldown: combatant.hasTalent(TALENTS.FIST_OF_JUSTICE_TALENT) ? 30 : 45,
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
        enabled: combatant.hasTalent(TALENTS.REBUKE_TALENT),
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
        enabled: combatant.hasTalent(TALENTS.CLEANSE_TOXINS_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        charges: 1,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.TURN_EVIL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.TURN_EVIL_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        channel: (haste: number) =>
          combatant.hasTalent(TALENTS.WRENCH_EVIL_TALENT) ? 0 : 1.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 1,
      },
      {
        spell: SPELLS.DIVINE_PROTECTION_RET.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT) ? 63 : 90,
        gcd: null,
      },

      // Blessings
      {
        spell: TALENTS.BLESSING_OF_FREEDOM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_FREEDOM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        charges: 1,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLESSING_OF_SACRIFICE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_SACRIFICE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.SACRIFICE_OF_THE_JUST_TALENT) ? 60 : 120,
      },
      {
        spell: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_PROTECTION_TALENT),
        buffSpellId: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.IMPROVED_BLESSING_OF_PROTECTION_TALENT) ? 240 : 300,
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
        spell: SPELLS.INTERCESSION.id,
        category: SPELL_CATEGORY.UTILITY,
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
    ];
  }
}

export default Abilities;
