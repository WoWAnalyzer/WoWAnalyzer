import SPELLS from 'common/SPELLS/classic';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational

      {
        spell: SPELLS.MANGLE_CAT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
      },
      {
        spell: SPELLS.SHRED.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
      },
      {
        spell: SPELLS.RAKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.SAVAGE_ROAR.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
      },
      {
        spell: [SPELLS.FAERIE_FIRE_FERAL.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
        cooldown: 6,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
      },
      {
        spell: SPELLS.RIP.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
      },
      {
        spell: SPELLS.FEROCIOUS_BITE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.SWIPE_CAT.id],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { static: 1000 },
        cooldown: 30,
      },
      // Cooldowns
      {
        spell: [SPELLS.BERSERK.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { static: 1000 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.TIGERS_FURY.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
      },
      // Defensive

      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.CAT_FORM.id],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: [SPELLS.FERAL_CHARGE_CAT.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1000 },
        cooldown: 30,
      },
      {
        spell: [SPELLS.DASH.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { static: 1000 },
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
        cooldown: 600,
      },
      {
        spell: [SPELLS.COWER.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { static: 1000 },
        cooldown: 10,
      },
      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
