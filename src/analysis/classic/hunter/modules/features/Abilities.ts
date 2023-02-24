import SPELLS from 'common/SPELLS/classic/hunter';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import RACIALS from 'common/SPELLS/classic/racials';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // SPELLS ADDED HERE ARE DISPLAYED ON THE STATISTICS TAB
      // LIST ALL SPELLS THAT COULD BE CAST DURING COMBAT BY THIS SPEC
      // Rotational
      {
        spell: SPELLS.AUTO_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      {
        spell: [SPELLS.SERPENT_STING.id, ...SPELLS.SERPENT_STING.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // Survival
      {
        spell: [SPELLS.EXPLOSIVE_SHOT.lowRanks[0]],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.EXPLOSIVE_SHOT.id, ...SPELLS.EXPLOSIVE_SHOT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BLACK_ARROW.id, ...SPELLS.BLACK_ARROW.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 30,
      },
      {
        spell: [SPELLS.EXPLOSIVE_TRAP.id, ...SPELLS.EXPLOSIVE_TRAP.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      // TODO only applies in Execute Phase 20%
      {
        spell: [SPELLS.KILL_SHOT.id, ...SPELLS.KILL_SHOT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 15,
      },
      {
        spell: [SPELLS.AIMED_SHOT.id, ...SPELLS.AIMED_SHOT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 10,
      },
      {
        spell: [SPELLS.MULTI_SHOT.id, ...SPELLS.MULTI_SHOT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 10,
      },
      {
        spell: [SPELLS.STEADY_SHOT.id, ...SPELLS.STEADY_SHOT.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },

      // Rotational AOE

      // Cooldowns
      {
        spell: [SPELLS.RAPID_FIRE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 300,
      },
      {
        spell: RACIALS.BERSERKING.id,
        buffSpellId: RACIALS.BERSERKING.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        isUndetectable: true,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          majorIssueEfficiency: 0.2,
          averageIssueEfficiency: 0.5,
          recommendedEfficiency: 0.7,
        },
      },

      // Defensive

      // Other spells (not apart of the normal rotation)

      // Utility

      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
