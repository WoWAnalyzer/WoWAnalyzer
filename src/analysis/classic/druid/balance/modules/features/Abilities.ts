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
        spell: [SPELLS.WRATH.id, ...SPELLS.WRATH.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.STARFIRE.id, ...SPELLS.STARFIRE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MOONFIRE.id, ...SPELLS.MOONFIRE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.INSECT_SWARM.id, ...SPELLS.INSECT_SWARM.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },

      // Rotational AOE
      {
        spell: [SPELLS.HURRICANE.id, ...SPELLS.HURRICANE.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.TYPHOON.id, ...SPELLS.TYPHOON.lowRanks],
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
        cooldown: 20,
      },

      // Cooldowns
      {
        spell: [SPELLS.STARFALL.id, ...SPELLS.STARFALL.lowRanks],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 90,
      },
      {
        spell: [SPELLS.FORCE_OF_NATURE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.INNERVATE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 180,
      },

      // Defensive
      {
        spell: [SPELLS.CYCLONE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.BARKSKIN.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 60,
      },
      {
        spell: [SPELLS.NATURES_GRASP.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },

      // Other spells (not apart of the normal rotation)

      // Utility

      // Pet Related

      // Consumable
    ];
  }
}

export default Abilities;
