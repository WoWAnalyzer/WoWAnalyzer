import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: [SPELLS.AVENGERS_SHIELD.id, ...SPELLS.AVENGERS_SHIELD.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.EXORCISM.id, ...SPELLS.EXORCISM.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_THE_RIGHTEOUS.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_WRATH.id, ...SPELLS.HAMMER_OF_WRATH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_WISDOM.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.JUDGEMENT_OF_LIGHT.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SHIELD_OF_RIGHTEOUSNESS.id, ...SPELLS.SHIELD_OF_RIGHTEOUSNESS.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_COMMAND_DMG.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      // Rotational AOE
      {
        spell: [SPELLS.CONSECRATION.id, ...SPELLS.CONSECRATION.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.AVENGING_WRATH.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180,
      },
      // Defensive
      {
        spell: [SPELLS.DIVINE_PROTECTION.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 180,
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.HOLY_LIGHT.id, ...SPELLS.HOLY_LIGHT.lowRanks],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LAY_ON_HANDS.id, ...SPELLS.LAY_ON_HANDS.lowRanks],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.CLEANSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_PLEA.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_SACRIFICE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.GREATER_BLESSING_OF_SANCTUARY.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_FREEDOM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_PROTECTION.id, ...SPELLS.HAND_OF_PROTECTION.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_RECKONING.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.HAND_OF_SACRIFICE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAMMER_OF_JUSTICE.id, ...SPELLS.HAMMER_OF_JUSTICE.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HAND_OF_SALVATION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HOLY_SHIELD.id, ...SPELLS.HOLY_SHIELD.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HOLY_WRATH.id, ...SPELLS.HOLY_WRATH.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RIGHTEOUS_DEFENSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.RIGHTEOUS_FURY.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.RETRIBUTION_AURA.id, ...SPELLS.RETRIBUTION_AURA.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SACRED_SHIELD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_COMMAND.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_CORRUPTION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SEAL_OF_JUSTICE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Pet Related
      // Consumable
      {
        spell: [SPELLS.NIGHTMARE_SEED.id],
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: null,
      },
    ];
  }
}

export default Abilities;
