import SPELLS from 'common/SPELLS/classic/druid';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: SPELLS.REJUVENATION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.REGROWTH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.LIFEBLOOM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SWIFTMEND.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.NOURISH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HEALING_TOUCH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: SPELLS.WILD_GROWTH.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: SPELLS.NATURES_SWIFTNESS_DRUID.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180,
      },
      {
        spell: SPELLS.INNERVATE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: SPELLS.REBIRTH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.TRANQUILITY.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
      },
      // Defensive
      {
        spell: SPELLS.BARKSKIN.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: SPELLS.ENTANGLING_ROOTS.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CYCLONE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      // Other spells (not apart of the normal rotation)

      // Utility
      {
        spell: SPELLS.REMOVE_CORRUPTION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
