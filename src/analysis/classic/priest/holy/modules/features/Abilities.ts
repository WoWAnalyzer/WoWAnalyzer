import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  // Note: Holy Priests have the "Tome of Light" talent that reduces all Holy Word cooldowns by 30% at 2/2 ranks.
  // We have to assume that they have this talented, so all cooldowns are multiplied by 0.7.
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: SPELLS.RENEW.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 }, // The "Rapid Renewal" talent reduces the GCD of renew
      },
      {
        spell: SPELLS.CIRCLE_OF_HEALING.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 10,
        // override the name because it is pulling in the Retail name in the ability list
        name: SPELLS.CIRCLE_OF_HEALING.name,
      },
      {
        spell: SPELLS.PRAYER_OF_MENDING.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 10,
        healSpellIds: [SPELLS.PRAYER_OF_MENDING_HEAL.id],
      },
      {
        spell: SPELLS.PRAYER_OF_HEALING.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        // TODO: this shows up as a channel on the timeline?
      },
      {
        spell: [SPELLS.FLASH_HEAL.id, SPELLS.FLASH_HEAL_SURGE_OF_LIGHT.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HEAL.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        name: SPELLS.HEAL.name,
      },

      // Rotational AOE

      // Cooldowns
      {
        spell: SPELLS.DIVINE_HYMN.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 3 * 60, // The Heavenly Voice talent reduces this to 3 minutes, down from 8
        healSpellIds: [SPELLS.DIVINE_HYMN_HEAL.id],
      },
      {
        spell: SPELLS.SHADOW_FIEND.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 300,
      },

      {
        spell: SPELLS.LIGHTWELL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
        healSpellIds: [SPELLS.LIGHTWELL_HEAL.id],
      },
      {
        spell: SPELLS.HYMN_OF_HOPE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 6 * 60,
      },

      // Defensive
      {
        spell: SPELLS.DESPERATE_PRAYER.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 120,
      },
      {
        spell: SPELLS.GUARDIAN_SPIRIT.id,
        category: SPELL_CATEGORY.DEFENSIVE, // we are inconsistent with where external defensives go
        gcd: null,
        cooldown: 180,
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: SPELLS.SMITE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.DEVOURING_PLAGUE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HOLY_FIRE.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
        cooldown: 10,
      },
      {
        spell: SPELLS.MIND_BLAST.id,
        category: SPELL_CATEGORY.HEALER_DAMAGING_SPELL,
        gcd: { base: 1500 },
        cooldown: 8,
      },

      // Utility
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        cooldown: 3,
      },
      {
        spell: SPELLS.PURIFY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CHAKRA.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 30,
      }, // Pet Related
      // Other
      {
        spell: SPELLS.POWER_WORD_FORTITUDE.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.INNER_FIRE.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },

      // Consumable
    ];
  }
}

export default Abilities;
