import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { TALENTS_PALADIN } from 'common/TALENTS';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;

    return [
      {
        spell: SPELLS.CONSECRATION_CAST.id,
        buffSpellId: SPELLS.CONSECRATION_BUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLESSED_HAMMER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: 3,
        enabled: combatant.hasTalent(TALENTS.BLESSED_HAMMER_TALENT),
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.AVENGERS_SHIELD_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
        buffSpellId: SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id,
        isDefensive: true,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      {
        spell: SPELLS.WORD_OF_GLORY.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        // T15: Holy Shield
        spell: TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 5 / (1 + haste),
        charges: 2,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(TALENTS.BLESSED_HAMMER_TALENT),
        castEfficiency: {
          suggestion: false,
        },
      },
      //COOLDOWNS
      {
        spell: [TALENTS.HOLY_ARMAMENTS_PROTECTION_TALENT.id, SPELLS.SACRED_WEAPON_TALENT.id],
        charges: 2,
        enabled: combatant.hasTalent(TALENTS.HOLY_ARMAMENTS_PROTECTION_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 - combatant.getTalentRank(TALENTS.FOREWARNING_TALENT) * 12,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ARDENT_DEFENDER_TALENT.id,
        buffSpellId: TALENTS.ARDENT_DEFENDER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ARDENT_DEFENDER_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120 * (combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT) ? 0.7 : 1),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: [
          TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
          SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id,
        ],
        buffSpellId: [
          TALENTS.GUARDIAN_OF_ANCIENT_KINGS_TALENT.id,
          SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id,
        ],
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 300,
        castEfficiency: {
          suggestion: true,
        },
      },
      // Avenging Wrath
      {
        spell: [TALENTS.AVENGING_WRATH_TALENT.id, TALENTS.AVENGING_WRATH_TALENT.id],
        buffSpellId: TALENTS.AVENGING_WRATH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        cooldown: combatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT) ? 60 : 120,
        duration: combatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT)
          ? (combatant.hasTalent(TALENTS.SANCTIFIED_WRATH_TALENT) ? 25000 : 20000) * 0.6
          : combatant.hasTalent(TALENTS.SANCTIFIED_WRATH_TALENT)
            ? 25000
            : 20000,
        enabled:
          combatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT) &&
          !combatant.hasTalent(TALENTS.SENTINEL_TALENT),
      },

      // Sentinel
      {
        spell: [TALENTS.SENTINEL_TALENT.id, TALENTS.SENTINEL_TALENT.id],
        buffSpellId: TALENTS.SENTINEL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        cooldown: combatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT) ? 60 : 120,
        duration: combatant.hasTalent(TALENTS.RIGHTEOUS_PROTECTOR_TALENT)
          ? (combatant.hasTalent(TALENTS.SANCTIFIED_WRATH_TALENT) ? 20000 : 16000) * 0.6
          : combatant.hasTalent(TALENTS.SANCTIFIED_WRATH_TALENT)
            ? 20000
            : 16000,
        enabled: combatant.hasTalent(TALENTS.SENTINEL_TALENT),
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DIVINE_STEED_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        charges: combatant.hasTalent(TALENTS.CAVALIER_TALENT) ? 2 : 1,
        gcd: null,
      },
      {
        spell: TALENTS.BLESSING_OF_FREEDOM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLESSING_OF_PROTECTION_TALENT.id,
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 5 * 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_PROTECTION_TALENT),
      },
      {
        spell: TALENTS.BLESSING_OF_SPELLWARDING_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_SPELLWARDING_TALENT),
      },
      {
        spell: TALENTS_PALADIN.BLESSING_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120 - 60 * combatant.getTalentRank(TALENTS.SACRIFICE_OF_THE_JUST_TALENT),
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
        spell: SPELLS.HAMMER_OF_JUSTICE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST_PROTECTION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 5 / (1 + haste),
        charges: combatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.HAMMER_OF_WRATH_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 5 / (1 + haste),
        charges: combatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
        enabled: combatant.hasTalent(TALENTS.HAMMER_OF_WRATH_TALENT),
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
        spell: TALENTS.BLINDING_LIGHT_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLINDING_LIGHT_TALENT),
      },
      {
        spell: SPELLS.DIVINE_SHIELD.id,
        buffSpellId: SPELLS.DIVINE_SHIELD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 300 * (combatant.hasTalent(TALENTS.UNBREAKABLE_SPIRIT_TALENT) ? 0.7 : 1),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LAY_ON_HANDS_CAST.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 600,
        gcd: null,
      },
      {
        spell: SPELLS.INTERCESSION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.FINAL_STAND.id,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: TALENTS.DIVINE_TOLL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 - 15 * combatant.getTalentRank(TALENTS.QUICKENED_INVOCATION_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DIVINE_TOLL_TALENT),
      },
      {
        spell: SPELLS.HAMMER_OF_LIGHT.id,
        enabled: combatant.hasTalent(TALENTS.LIGHTS_GUIDANCE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
