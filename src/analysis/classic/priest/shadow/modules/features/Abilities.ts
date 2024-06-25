import SPELLS from 'common/SPELLS/classic/priest';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // Rotational
      {
        spell: SPELLS.DEVOURING_PLAGUE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.MIND_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MIND_FLAY.id, ...SPELLS.MIND_FLAY.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_WORD_DEATH.id, ...SPELLS.SHADOW_WORD_DEATH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SHADOW_WORD_PAIN.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.VAMPIRIC_TOUCH.id, ...SPELLS.VAMPIRIC_TOUCH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.MIND_SEAR.id, ...SPELLS.MIND_SEAR.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      // Cooldowns
      {
        spell: [SPELLS.INNER_FOCUS.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180,
      },
      {
        spell: [SPELLS.SHADOW_FIEND.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180,
      },
      // Defensive
      {
        spell: [SPELLS.DISPERSION.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
        cooldown: 120,
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: SPELLS.FLASH_HEAL.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.POWER_WORD_SHIELD.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.RENEW.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.ABOLISH_DISEASE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DISPEL_MAGIC.id, ...SPELLS.DISPEL_MAGIC.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_SPIRIT.id, ...SPELLS.DIVINE_SPIRIT.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.DIVINE_HYMN.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FADE.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.FEAR_WARD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.INNER_FIRE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MASS_DISPEL.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.POWER_WORD_FORTITUDE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [
          SPELLS.PRAYER_OF_SHADOW_PROTECTION.id,
          ...SPELLS.PRAYER_OF_SHADOW_PROTECTION.lowRanks,
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.PSYCHIC_SCREAM.id, ...SPELLS.PSYCHIC_SCREAM.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SHACKLE_UNDEAD.id, ...SPELLS.SHACKLE_UNDEAD.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SHADOWFORM.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      // Pet Related
      // Consumable
    ];
  }
}

export default Abilities;
