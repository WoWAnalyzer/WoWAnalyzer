import SPELLS from 'common/SPELLS/classic/druid';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: [SPELLS.REJUVENATION.id, ...SPELLS.REJUVENATION.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.REGROWTH.id, ...SPELLS.REGROWTH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.LIFEBLOOM.id, ...SPELLS.LIFEBLOOM.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SWIFTMEND.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.NOURISH.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.HEALING_TOUCH.id, ...SPELLS.HEALING_TOUCH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.WILD_GROWTH.id, ...SPELLS.WILD_GROWTH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.NATURES_SWIFTNESS_DRUID.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180,
      },
      {
        spell: [SPELLS.INNERVATE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.REBIRTH.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.TRANQUILITY.id, ...SPELLS.TRANQUILITY.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },
      // Defensive
      {
        spell: [SPELLS.BARKSKIN.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: [SPELLS.ENTANGLING_ROOTS.id, ...SPELLS.ENTANGLING_ROOTS.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CYCLONE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      // Other spells (not apart of the normal rotation)

      // Utility
      {
        spell: [SPELLS.REMOVE_CURSE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ABOLISH_POISON.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CURE_POISON.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
