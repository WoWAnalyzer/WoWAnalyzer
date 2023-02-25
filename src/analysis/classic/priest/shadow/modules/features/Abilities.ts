import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // LIST ALL SPELLS THAT COULD BE CAST DURING COMBAT BY THIS SPEC
      // Rotational
      {
        spell: [SPELLS.SHADOW_WORD_PAIN.id, ...SPELLS.SHADOW_WORD_PAIN.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.VAMPIRIC_TOUCH.id, ...SPELLS.VAMPIRIC_TOUCH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MIND_FLAY.id, ...SPELLS.VAMPIRIC_TOUCH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.SHADOW_WORD_DEATH.id, ...SPELLS.SHADOW_WORD_DEATH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MIND_BLAST.id, ...SPELLS.MIND_BLAST.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.MIND_SEAR.id, ...SPELLS.MIND_SEAR.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },

      // Cooldowns
      {
        spell: [SPELLS.SHADOW_FIEND.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      // Defensive
      {
        spell: [SPELLS.DISPERSION.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },

      // Other spells (not apart of the normal rotation)

      // Utility

      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
