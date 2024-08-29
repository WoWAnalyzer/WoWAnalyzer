import SPELLS from 'common/SPELLS/warrior';
import TALENTS from 'common/TALENTS/warrior';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.RAMPAGE.id,
        enabled: combatant.hasTalent(TALENTS.RAMPAGE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ONSLAUGHT.id,
        enabled: combatant.hasTalent(TALENTS.ONSLAUGHT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 18 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.RAGING_BLOW.id, SPELLS.CRUSHING_BLOW.id],
        enabled: combatant.hasTalent(TALENTS.RAGING_BLOW_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 8 / (1 + haste),
        charges: 1 + (combatant.hasTalent(TALENTS.IMPROVED_RAGING_BLOW_TALENT) ? 1 : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.BLOODTHIRST.id, SPELLS.BLOODBATH.id],
        enabled: combatant.hasTalent(TALENTS.BLOODTHIRST_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.EXECUTE_FURY.id, SPELLS.EXECUTE_FURY_MASSACRE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) =>
          (6 - (combatant.hasTalent(TALENTS.MASSACRE_FURY_TALENT) ? 1.5 : 0)) / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SLAM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      // Rotational AOE
      {
        spell: SPELLS.WHIRLWIND_FURY_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      // Others
      {
        enabled: combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        spell: SPELLS.IMPENDING_VICTORY_TALENT_HEAL.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        enabled: !combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
        spell: SPELLS.VICTORY_RUSH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THUNDER_CLAP.id,
        enabled: combatant.hasTalent(TALENTS.THUNDER_CLAP_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      // Cooldown
      {
        spell: SPELLS.RECKLESSNESS.id,
        enabled:
          combatant.hasTalent(TALENTS.RECKLESSNESS_TALENT) ||
          combatant.hasTalent(TALENTS.BERSERKERS_TORMENT_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MAJOR,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS.RAVAGER_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.RAVAGER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MAJOR,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.AVATAR_SHARED.id,
        enabled: combatant.hasTalent(TALENTS.AVATAR_SHARED_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MAJOR,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS.THUNDEROUS_ROAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.THUNDEROUS_ROAR_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90 - (combatant.hasTalent(TALENTS.UPROAR_TALENT) ? 45 : 0),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MAJOR,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: TALENTS.CHAMPIONS_SPEAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAMPIONS_SPEAR_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MAJOR,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.ODYNS_FURY.id,
        enabled: combatant.hasTalent(TALENTS.ODYNS_FURY_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MAJOR,
          recommendedEfficiency: 0.95,
        },
      },
      // Defensive
      {
        spell: SPELLS.SPELL_REFLECTION.id,
        enabled: combatant.hasTalent(TALENTS.SPELL_REFLECTION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.SPELL_REFLECTION.id,
        cooldown: 25 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        gcd: null,
      },
      {
        spell: SPELLS.ENRAGED_REGENERATION.id,
        enabled: combatant.hasTalent(TALENTS.ENRAGED_REGENERATION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.ENRAGED_REGENERATION.id,
        cooldown: 120 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: 'Use it to reduce damage taken for a short period.',
        },
      },
      {
        spell: TALENTS.BITTER_IMMUNITY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BITTER_IMMUNITY_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: TALENTS.BITTER_IMMUNITY_TALENT.id,
        cooldown: 3 * 60,
        gcd: null,
      },
      {
        spell: SPELLS.RALLYING_CRY.id,
        enabled: combatant.hasTalent(TALENTS.RALLYING_CRY_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.RALLYING_CRY_BUFF.id,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion:
            'Use it preemptively as a buffer against large AOE, or reactively if you notice your raid is getting dangerously low on health.',
        },
      },
      // Utility
      {
        spell: SPELLS.CHARGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20 - (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 1 : 0),
      },
      {
        spell: SPELLS.HEROIC_LEAP.id,
        enabled: combatant.hasTalent(TALENTS.HEROIC_LEAP_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: SPELLS.BOUNDING_STRIDE_BUFF.id,
        cooldown: 45 - (combatant.hasTalent(TALENTS.BOUNDING_STRIDE_TALENT) ? 15 : 0),
        charges: 1,
        gcd: null,
      },
      {
        spell: SPELLS.INTERVENE_CAST.id,
        enabled: combatant.hasTalent(TALENTS.INTERVENE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        gcd: null,
      },
      {
        spell: TALENTS.STORM_BOLT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.STORM_BOLT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.4,
          extraSuggestion:
            "If you're picking a utility talent over something that increases your mobility or survivability, you better use it.",
        },
      },
      {
        spell: TALENTS.SHOCKWAVE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.SHOCKWAVE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 40,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown:
          (15 - (combatant.hasTalent(TALENTS.CONCUSSIVE_BLOWS_TALENT) ? 1 : 0)) *
          (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        gcd: null,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: SPELLS.BERSERKER_RAGE.id,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: TALENTS.BERSERKER_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.BERSERKER_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: TALENTS.BERSERKER_SHOUT_TALENT.id,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: SPELLS.HEROIC_THROW.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.WRECKING_THROW_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WRECKING_THROW_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHATTERING_THROW.id,
        enabled: combatant.hasTalent(TALENTS.SHATTERING_THROW_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INTIMIDATING_SHOUT.id,
        enabled: combatant.hasTalent(TALENTS.INTIMIDATING_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PIERCING_HOWL.id,
        enabled: combatant.hasTalent(TALENTS.PIERCING_HOWL_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BATTLE_SHOUT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAUNT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 8,
        gcd: null,
      },
      {
        spell: SPELLS.IMPENDING_VICTORY.id,
        category: SPELL_CATEGORY.SEMI_DEFENSIVE,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
