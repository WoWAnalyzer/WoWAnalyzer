import SPELLS from 'common/SPELLS';
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
        cooldown: (haste) => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLESSED_HAMMER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
        charges: 3,
        enabled: combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT),
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.AVENGERS_SHIELD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 15 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      // Probably useless to try to count the number of casts
      //Note by yajinni: Since this is thier main source of damage mitigation, without it they get hit like by a truck.
      //And a main source of damage, it should be tracked somewhat. Keeping it at 80% for now.
      {
        spell: SPELLS.SHIELD_OF_THE_RIGHTEOUS.id,
        buffSpellId: SPELLS.SHIELD_OF_THE_RIGHTEOUS_BUFF.id,
        isDefensive: true,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      {
        // T15: Holy Shield
        spell: SPELLS.HAMMER_OF_THE_RIGHTEOUS.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
        charges: 2,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.BLESSED_HAMMER_TALENT),
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.JUDGMENT_CAST_PROTECTION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
        charges: combatant.hasTalent(SPELLS.CRUSADERS_JUDGMENT_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.WORD_OF_GLORY.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      //COOLDOWNS
      {
        spell: SPELLS.ARDENT_DEFENDER.id,
        buffSpellId: SPELLS.ARDENT_DEFENDER.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 120 * (combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT) ? 0.7 : 1),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: [SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id, SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id],
        buffSpellId: [
          SPELLS.GUARDIAN_OF_ANCIENT_KINGS.id,
          SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id,
        ],
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 300,
        castEfficiency: {
          suggestion: true,
        },
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
        spell: SPELLS.AVENGING_WRATH.id,
        buffSpellId: SPELLS.AVENGING_WRATH.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 120,
        // castEfficiency: {
        //   suggestion: true,
        //   recommendedEfficiency: 0.85,
        // },
      },
      {
        spell: SPELLS.LAY_ON_HANDS.id,
        isDefensive: true,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 600,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.FLASH_OF_LIGHT.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DIVINE_STEED.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        charges: combatant.hasTalent(SPELLS.CAVALIER_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
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
        isDefensive: true,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 5 * 60,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.BLESSING_OF_SPELLWARDING_TALENT),
      },
      {
        spell: SPELLS.BLESSING_OF_SPELLWARDING_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.BLESSING_OF_SPELLWARDING_TALENT),
      },
      {
        spell: TALENTS_PALADIN.BLESSING_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
      },
      {
        spell: SPELLS.CLEANSE_TOXINS.id,
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
        spell: SPELLS.HAMMER_OF_WRATH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 7.5 / (1 + haste),
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
        spell: SPELLS.DIVINE_SHIELD.id,
        buffSpellId: SPELLS.DIVINE_SHIELD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 300 * (combatant.hasTalent(SPELLS.UNBREAKABLE_SPIRIT_TALENT) ? 0.7 : 1),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.FINAL_STAND_TALENT),
      },
    ];
  }
}

export default Abilities;
