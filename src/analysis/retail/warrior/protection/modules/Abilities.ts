import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TALENTS from 'common/TALENTS/warrior';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Baseline
      {
        spell: SPELLS.SLAM.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: SPELLS.CHARGE.id,
        cooldown: 20 - (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 1 : 0),
        category: SPELL_CATEGORY.UTILITY,
      },
      {
        spell: SPELLS.SHIELD_SLAM.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => {
          if (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT)) {
            return 8 / (1 + haste);
          }
          return 9 / (1 + haste);
        },
      },
      {
        spell: SPELLS.HAMSTRING.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: SPELLS.VICTORY_RUSH.id,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
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
        cooldown:
          15 -
          (combatant.hasTalent(TALENTS.CONCUSSIVE_BLOWS_TALENT) ? 1 : 0) -
          (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 1 : 0),
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
        cooldown: 15000,
      },
      {
        spell: SPELLS.EXECUTE.id,
        enabled: !false,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        enabled: !combatant.hasTalent(TALENTS.BERSERKER_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
      },
      {
        spell: SPELLS.HEROIC_THROW.id,
        enabled: !(
          combatant.hasTalent(TALENTS.SHATTERING_THROW_TALENT) ||
          combatant.hasTalent(TALENTS.WRECKING_THROW_TALENT)
        ),
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: SPELLS.DEVASTATE.id,
        enabled: !combatant.hasTalent(TALENTS.DEVASTATOR_TALENT),
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: TALENTS.IMPENDING_VICTORY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: [TALENTS.INTERVENE_TALENT.id, SPELLS.INTERVENE_BUFF.id, SPELLS.INTERVENE_CHARGE.id],
        enabled: combatant.hasTalent(TALENTS.INTERVENE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
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
        spell: TALENTS.BERSERKER_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BERSERKER_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 60,
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
        spell: TALENTS.SPELL_REFLECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPELL_REFLECTION_TALENT),

        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 20 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
      },
      {
        spell: TALENTS.HEROIC_LEAP_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.HEROIC_LEAP_TALENT),
        category: SPELL_CATEGORY.HIDDEN,
        cooldown: 45 - (combatant.hasTalent(TALENTS.BOUNDING_STRIDE_TALENT) ? 15 : 0),
      },
      {
        spell: TALENTS.INTIMIDATING_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.INTIMIDATING_SHOUT_TALENT),

        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
      },
      {
        spell: TALENTS.THUNDER_CLAP_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.THUNDER_CLAP_TALENT),

        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL, // 6 / (1 + haste)
        cooldown: (haste) => {
          if (
            combatant.hasTalent(TALENTS.UNSTOPPABLE_FORCE_TALENT) &&
            combatant.hasBuff(TALENTS.AVATAR_TALENT.id)
          ) {
            return 6 / 2 / (1 + haste);
          }
          return 6 / (1 + haste);
        },
      },
      {
        spell: TALENTS.WRECKING_THROW_TALENT.id,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.WRECKING_THROW_TALENT),
      },
      {
        spell: TALENTS.SHATTERING_THROW_TALENT.id,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS.SHATTERING_THROW_TALENT),
      },
      {
        spell: TALENTS.STORM_BOLT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.STORM_BOLT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
      },
      {
        spell: TALENTS.BITTER_IMMUNITY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BITTER_IMMUNITY_TALENT),
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 180,
      },
      {
        spell: TALENTS.AVATAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.AVATAR_TALENT),

        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
      },
      {
        spell: TALENTS.THUNDEROUS_ROAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.THUNDEROUS_ROAR_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90 - (combatant.hasTalent(TALENTS.UPROAR_TALENT) ? 45 : 0),
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
      {
        spell: TALENTS.SHOCKWAVE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHOCKWAVE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 40,
      },

      // Spec Tree
      {
        spell: TALENTS.IGNORE_PAIN_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.IGNORE_PAIN_TALENT),

        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
      },
      {
        spell: TALENTS.REVENGE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.REVENGE_TALENT),

        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: TALENTS.LAST_STAND_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.LAST_STAND_TALENT),

        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180 - (combatant.hasTalent(TALENTS.BOLSTER_TALENT) ? 60 : 0),
      },
      {
        spell: TALENTS.CHALLENGING_SHOUT_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.CHALLENGING_SHOUT_TALENT) &&
          !combatant.hasTalent(TALENTS.DISRUPTING_SHOUT_TALENT),

        category: SPELL_CATEGORY.HIDDEN,
        cooldown: 90,
      },
      {
        spell: TALENTS.REND_PROTECTION_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.REND_PROTECTION_TALENT),
        gcd: {
          base: 1500,
        },
        category: SPELL_CATEGORY.HIDDEN,
      },
      {
        spell: TALENTS.DISRUPTING_SHOUT_TALENT.id,
        enabled:
          combatant.hasTalent(TALENTS.CHALLENGING_SHOUT_TALENT) &&
          combatant.hasTalent(TALENTS.DISRUPTING_SHOUT_TALENT),

        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
      },
      {
        spell: TALENTS.SHIELD_WALL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHIELD_WALL_TALENT),

        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          (210 - (combatant.hasTalent(TALENTS.DEFENDERS_AEGIS_TALENT) ? 30 : 0)) *
          (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        charges: 1 + (combatant.hasTalent(TALENTS.DEFENDERS_AEGIS_TALENT) ? 1 : 0),
      },
      {
        spell: TALENTS.SPELL_BLOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SPELL_BLOCK_TALENT),

        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 90,
      },
      {
        spell: TALENTS.SHIELD_CHARGE_TALENT.id,

        enabled: combatant.hasTalent(TALENTS.SHIELD_CHARGE_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.RAVAGER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RAVAGER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        charges: 1 + (combatant.hasTalent(TALENTS.STORM_OF_STEEL_TALENT) ? 1 : 0),
      },
    ];
  }
}

export default Abilities;
