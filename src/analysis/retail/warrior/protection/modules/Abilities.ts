import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TALENTS from 'common/TALENTS/warrior';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Baseline for warrior in general
      {
        spell: SPELLS.SLAM.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHARGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20 - (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 1 : 0),
      },
      {
        spell: SPELLS.SHIELD_SLAM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 9 / (1 + haste),
      },
      {
        spell: SPELLS.HAMSTRING.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VICTORY_RUSH.id,
        enabled: !combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHIELD_BLOCK.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: (haste) => 16 / (1 + haste),
        charges: 2,
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.9 : 1),
      },
      {
        spell: SPELLS.TAUNT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
      },
      {
        spell: SPELLS.WHIRLWIND.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BATTLE_SHOUT.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EXECUTE.id,
        enabled: !false,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 6 / (1 + haste),
      },
      {
        spell: SPELLS.HEROIC_THROW.id,
        category: SPELL_CATEGORY.HIDDEN,
        gcd: {
          base: 1500,
        },
        cooldown: 1,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        enabled: !combatant.hasTalent(TALENTS.BERSERKER_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60 * (combatant.hasTalent(TALENTS.FEARLESS_TALENT) ? 0.5 : 1),
      },
      // Baseline for Protection warrior
      {
        spell: SPELLS.DEVASTATE.id,
        enabled: !combatant.hasTalent(TALENTS.DEVASTATOR_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CHALLENGING_SHOUT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
      },
      // Class Tree
      {
        spell: [TALENTS.BATTLE_STANCE_TALENT.id, TALENTS.DEFENSIVE_STANCE_TALENT.id],
        enabled:
          combatant.hasTalent(TALENTS.BATTLE_STANCE_TALENT) ||
          combatant.hasTalent(TALENTS.DEFENSIVE_STANCE_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: 3000,
      },
      {
        spell: [TALENTS.THUNDER_CLAP_TALENT.id, SPELLS.THUNDER_BLAST.id],
        enabled: combatant.hasTalent(TALENTS.THUNDER_CLAP_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: (haste) => 6 / (1 + haste),
      },
      {
        spell: TALENTS.IMPENDING_VICTORY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: SPELLS.HEROIC_LEAP.id,
        enabled: combatant.hasTalent(TALENTS.HEROIC_LEAP_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: 45 - (combatant.hasTalent(TALENTS.BOUNDING_STRIDE_TALENT) ? 15 : 0),
      },
      {
        spell: TALENTS.STORM_BOLT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.STORM_BOLT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown:
          (30 + (combatant.hasTalent(TALENTS.STORM_BOLTS_TALENT) ? 10 : 0)) *
          (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.9 : 1),
      },
      {
        spell: TALENTS.REND_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.REND_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 6,
      },
      {
        spell: [TALENTS.INTERVENE_TALENT.id, SPELLS.INTERVENE_BUFF.id, SPELLS.INTERVENE_CHARGE.id],
        enabled: combatant.hasTalent(TALENTS.INTERVENE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.9 : 1),
      },
      {
        spell: TALENTS.SHOCKWAVE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHOCKWAVE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 40 - (combatant.hasTalent(TALENTS.EARTHQUAKER_TALENT) ? 5 : 0),
      },
      {
        spell: TALENTS.RALLYING_CRY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RALLYING_CRY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
      },
      {
        spell: TALENTS.SPELL_REFLECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPELL_REFLECTION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 25 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.9 : 1),
      },
      {
        spell: TALENTS.WRECKING_THROW_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WRECKING_THROW_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS.JAVELINEER_TALENT),
        },
      },
      {
        spell: TALENTS.SHATTERING_THROW_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHATTERING_THROW_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        castEfficiency: {
          suggestion: combatant.hasTalent(TALENTS.JAVELINEER_TALENT),
        },
      },
      {
        spell: TALENTS.BERSERKER_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BERSERKER_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
      },
      {
        spell: TALENTS.INTIMIDATING_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.INTIMIDATING_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
      },
      {
        spell: TALENTS.PIERCING_HOWL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.PIERCING_HOWL_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
      },
      {
        spell: TALENTS.CHAMPIONS_SPEAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAMPIONS_SPEAR_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
      },
      // Spec Tree
      {
        spell: TALENTS.IGNORE_PAIN_PROTECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.IGNORE_PAIN_PROTECTION_TALENT),
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 1,
      },
      {
        spell: TALENTS.DEMORALIZING_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEMORALIZING_SHOUT_TALENT),
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
      },
      {
        spell: TALENTS.REVENGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.REVENGE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DISRUPTING_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DISRUPTING_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
      },
      {
        spell: TALENTS.SHIELD_WALL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHIELD_WALL_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          (180 - (combatant.hasTalent(TALENTS.DEFENDERS_AEGIS_TALENT) ? 60 : 0)) *
          (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.9 : 1),
        charges: combatant.hasTalent(TALENTS.DEFENDERS_AEGIS_TALENT) ? 2 : 1,
      },
      {
        spell: TALENTS.AVATAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.AVATAR_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
      },
      {
        spell: TALENTS.RAVAGER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RAVAGER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
      },
      {
        spell: SPELLS.SHIELD_CHARGE.id,
        enabled: combatant.hasTalent(TALENTS.SHIELD_CHARGE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
      },
      // Hero Talents - Colssus
      {
        spell: TALENTS.DEMOLISH_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.DEMOLISH_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
      },
    ];
  }
}

export default Abilities;
