import SPELLS from 'common/SPELLS/classic/rogue';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: [SPELLS.MUTILATE.id, ...SPELLS.MUTILATE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.SLICE_AND_DICE.id, ...SPELLS.SLICE_AND_DICE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.HUNGER_FOR_BLOOD.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.ENVENOM.id, ...SPELLS.ENVENOM.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.RUPTURE.id, ...SPELLS.RUPTURE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1000 },
      },
      // Rotational AOE
      {
        spell: [SPELLS.FAN_OF_KNIVES.id],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1000 },
      },
      // Cooldowns
      {
        spell: [SPELLS.TRICKS_OF_THE_TRADE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 },
        cooldown: 30,
      },
      {
        spell: [SPELLS.COLD_BLOOD.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180,
      },
      {
        spell: [SPELLS.BLADE_FLURRY.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1000 },
        cooldown: 120,
      },
      // Defensive
      {
        spell: [SPELLS.FEINT.id, ...SPELLS.FEINT.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.EVASION.id, ...SPELLS.EVASION.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: [SPELLS.VANISH.id, ...SPELLS.VANISH.lowRanks],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: [SPELLS.CLOAK_OF_SHADOWS.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1000 },
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.EVISCERATE.id, ...SPELLS.EVISCERATE.lowRanks],
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1000 },
      },
      // Utility
      {
        spell: [SPELLS.EXPOSE_ARMOR.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.KICK.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.KIDNEY_SHOT.id, ...SPELLS.KIDNEY_SHOT.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
      },
      {
        spell: [SPELLS.SPRINT.id, ...SPELLS.SPRINT.lowRanks],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      // Consumable
      {
        spell: [SPELLS.RESTORE_ENERGY.id],
        category: SPELL_CATEGORY.CONSUMABLE,
        gcd: null,
        cooldown: 300,
      },
    ];
  }
}

export default Abilities;
