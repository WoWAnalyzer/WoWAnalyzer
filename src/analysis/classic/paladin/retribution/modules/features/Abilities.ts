import SPELLS from 'common/SPELLS/classic/paladin';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: [SPELLS.CRUSADER_STRIKE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_STORM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_WRATH.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.EXORCISM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HOLY_WRATH.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.INQUISITION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.TEMPLARS_VERDICT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.CONSECRATION.id],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.AVENGING_WRATH.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: [SPELLS.DIVINE_PLEA.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 60,
      },
      {
        spell: SPELLS.ZEALOTRY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
      },
      // Defensive
      {
        spell: [SPELLS.SACRED_SHIELD.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_JUSTICE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LAY_ON_HANDS.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_SHIELD.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_PROTECTION.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_FREEDOM.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_PROTECTION.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: [SPELLS.HAND_OF_SACRIFICE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_SALVATION.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.FLASH_OF_LIGHT.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.AURA_MASTERY.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.CLEANSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_SACRIFICE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_RECKONING.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.JUDGEMENT.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_TRUTH.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_CORRUPTION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_RIGHTEOUSNESS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_INSIGHT.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_JUSTICE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RETRIBUTION_AURA.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RESISTANCE_AURA.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.REBUKE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
