import SPELLS from 'common/SPELLS/classic/hunter';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import RACIALS from 'common/SPELLS/classic/racials';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      // KILL_SHOT is handled in shared KillShot.ts because it only is valid in execute phase
      {
        spell: SPELLS.AUTO_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      {
        spell: SPELLS.SERPENT_STING.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.CHIMERA_SHOT.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.EXPLOSIVE_TRAP.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        // gcd tracking with delayed trigger of trap seems to be a problem
        gcd: null,
        // Each talent point(3) in resources reduces cooldown by 2 seconds
        cooldown: 24,
      },
      {
        spell: SPELLS.ARCANE_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.AIMED_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 10,
      },
      {
        spell: SPELLS.MULTI_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 10,
      },
      {
        spell: SPELLS.STEADY_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.RAPTOR_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.MONGOOSE_BITE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },

      // Rotational AOE
      {
        spell: SPELLS.VOLLEY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },

      // Cooldowns
      {
        spell: [SPELLS.RAPID_FIRE.id],
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
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
      {
        spell: RACIALS.BLOOD_FURY_PHYSICAL.id,
        buffSpellId: RACIALS.BLOOD_FURY_PHYSICAL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
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
      {
        spell: [SPELLS.DISENGAGE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 25,
      },

      // Other spells (not apart of the normal rotation)
      {
        spell: [SPELLS.SILENCING_SHOT.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 20,
      },
      {
        spell: [SPELLS.READINESS.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1000 },
        cooldown: 180,
      },
      {
        spell: [SPELLS.HUNTERS_MARK.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.MISDIRECTION.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: [SPELLS.ASPECT_CHEETAH.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.ASPECT_HAWK.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: [SPELLS.ASPECT_WILD.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },

      // Utility

      // Pet Related
      {
        spell: [SPELLS.KILL_COMMAND.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },

      // Consumable
    ];
  }
}

export default Abilities;
