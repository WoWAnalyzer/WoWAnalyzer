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
      //COOLDOWNS
      {
        spell: [TALENTS.HOLY_ARMAMENTS_TALENT.id, SPELLS.SACRED_WEAPON_TALENT.id],
        charges: 2,
        enabled: combatant.hasTalent(TALENTS.HOLY_ARMAMENTS_TALENT),
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
        spell: TALENTS.BASTION_OF_LIGHT_TALENT.id,
        buffSpellId: TALENTS.BASTION_OF_LIGHT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BASTION_OF_LIGHT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
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
      {
        spell: [TALENTS.AVENGING_WRATH_TALENT.id, TALENTS.AVENGING_WRATH_TALENT.id],
        buffSpellId: TALENTS.AVENGING_WRATH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        cooldown: 120,
        enabled:
          combatant.hasTalent(TALENTS.AVENGING_WRATH_TALENT) &&
          !combatant.hasTalent(TALENTS.SENTINEL_TALENT),
      },
      {
        spell: [TALENTS.SENTINEL_TALENT.id, SPELLS.SENTINEL.id],
        buffSpellId: SPELLS.SENTINEL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.SENTINEL_TALENT),
      },
      {
        spell: SPELLS.LAY_ON_HANDS_EMPYREAL_WARD.id,
        isDefensive: true,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 600,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
        },
        enabled: combatant.hasTalent(TALENTS.EMPYREAL_WARD_TALENT),
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
        spell: TALENTS.HAMMER_OF_WRATH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 7.5 / (1 + haste),
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
        spell: TALENTS.LAY_ON_HANDS_TALENT.id,
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
        spell: TALENTS.DIVINE_TOLL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
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
        spell: TALENTS.MOMENT_OF_GLORY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(TALENTS.MOMENT_OF_GLORY_TALENT),
      },
      {
        spell: TALENTS.EYE_OF_TYR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: combatant.hasTalent(TALENTS.INMOST_LIGHT_TALENT) ? 40 : 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.EYE_OF_TYR_TALENT),
      },
    ];
  }
}

export default Abilities;
