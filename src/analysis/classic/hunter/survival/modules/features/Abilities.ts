import SPELLS from 'common/SPELLS/classic/hunter';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

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
        spell: SPELLS.ARCANE_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.COBRA_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { static: 1000 },
      },
      {
        spell: SPELLS.SERPENT_STING.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.EXPLOSIVE_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 6,
        castEfficiency: {},
      },
      {
        // black arrow shares a cooldown with explosive trap. the latter is used on AoE
        spell: [SPELLS.BLACK_ARROW.id, SPELLS.EXPLOSIVE_TRAP.id, SPELLS.EXPLOSIVE_TRAP_LAUNCHER.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        // Each talent point(3) in resources reduces cooldown by 2 seconds
        cooldown: 24,
      },
      {
        spell: SPELLS.MULTI_SHOT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
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
      // Defensive
      {
        spell: [SPELLS.DISENGAGE.id],
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
        cooldown: 16, // glyph reduces by 5s and talents by another 4s
      },

      // Other spells (not apart of the normal rotation)
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
      {
        spell: [SPELLS.ASPECT_VIPER.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.ASPECT_OF_THE_FOX.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },

      // Utility

      {
        spell: [SPELLS.FREEZING_TRAP.id, SPELLS.FREEZING_TRAP_LAUNCHER.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        cooldown: 24,
      },
      // technically a shared cooldown
      {
        spell: [SPELLS.ICE_TRAP.id, SPELLS.ICE_TRAP_LAUNCHER.id],
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        cooldown: 24,
      },
      {
        spell: SPELLS.TRAP_LAUNCHER.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.DISTRACTING_SHOT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
        cooldown: 8,
      },

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
