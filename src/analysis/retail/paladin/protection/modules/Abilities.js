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
        cooldown: (haste) => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.BLESSED_HAMMER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
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
        spell: TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 6 / (1 + haste),
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
        cooldown: (haste) => 6 / (1 + haste),
        charges: combatant.hasTalent(TALENTS.CRUSADERS_JUDGMENT_TALENT) ? 2 : 1,
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
        spell: SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id,
        buffSpellId: SPELLS.GUARDIAN_OF_ANCIENT_KINGS_QUEEN.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 300,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.SERAPHIM_TALENT.id,
        buffSpellId: TALENTS.SERAPHIM_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SERAPHIM_TALENT),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: TALENTS.AVENGING_WRATH_TALENT.id,
        buffSpellId: TALENTS.AVENGING_WRATH_TALENT.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 120,
        // castEfficiency: {
        //   suggestion: true,
        //   recommendedEfficiency: 0.85,
        // },
      },
      {
        spell: TALENTS.LAY_ON_HANDS_TALENT.id,
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
        spell: TALENTS.DIVINE_STEED_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        charges: combatant.hasTalent(TALENTS.CAVALIER_TALENT) ? 2 : 1,
        gcd: {
          base: 1500,
        },
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
        enabled: !combatant.hasTalent(TALENTS.BLESSING_OF_SPELLWARDING_TALENT),
      },
      {
        spell: TALENTS.BLESSING_OF_SPELLWARDING_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.BLESSING_OF_SPELLWARDING_TALENT),
      },
      {
        spell: TALENTS_PALADIN.BLESSING_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
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
        enabled: combatant.hasTalent(TALENTS.FINAL_STAND_TALENT),
      },
    ];
  }
}

export default Abilities;
