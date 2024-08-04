import SPELLS from 'common/SPELLS/classic/warrior';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    return [
      // Rotational
      {
        spell: SPELLS.BLOODTHIRST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
        cooldown: 4,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.SLAM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HEROIC_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
      },
      // Rotational AOE
      {
        spell: SPELLS.WHIRLWIND.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: { base: 1500 },
        cooldown: 8,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.85,
        },
      },
      {
        spell: SPELLS.CLEAVE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: null,
      },
      // Cooldowns
      {
        spell: SPELLS.DEATH_WISH.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: { base: 1500 },
        cooldown: 120.6,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.RECKLESSNESS.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 201,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      // Defensive
      {
        spell: SPELLS.ENRAGED_REGENERATION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: SPELLS.INTIMIDATING_SHOUT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SHIELD_BLOCK.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: SPELLS.SHIELD_WALL.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: null,
      },
      {
        spell: SPELLS.DISARM.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: { base: 1500 },
      },
      // Other spells (not apart of the normal rotation)
      {
        spell: SPELLS.VICTORY_RUSH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HEROIC_THROW.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: { base: 1500 },
      },
      // Utility
      {
        spell: SPELLS.SUNDER_ARMOR.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.SHIELD_BASH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.HAMSTRING.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.CHARGE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.INTERVENE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.INTERCEPT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.TAUNT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
      {
        spell: SPELLS.THUNDER_CLAP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: { base: 1500 },
      },
      {
        spell: SPELLS.SPELL_REFLECTION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
      },
    ];
  }
}

export default Abilities;
