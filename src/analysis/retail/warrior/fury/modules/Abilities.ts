import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/warrior';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import TALENTS from 'common/TALENTS/warrior';

// Sample - Cold Steel, Anger Management, Spear of Bastion
// https://www.warcraftlogs.com/reports/RVwcm3bNzJaXAMqW#fight=4&type=summary&source=17

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.RAMPAGE.id,
        enabled: combatant.hasTalent(talents.RAMPAGE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ONSLAUGHT_TALENT.id,
        enabled: combatant.hasTalent(talents.ONSLAUGHT_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 18,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RAGING_BLOW.id,
        enabled: combatant.hasTalent(talents.RAGING_BLOW_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) =>
          (combatant.hasTalent(TALENTS.HONED_REFLEXES_FURY_TALENT) ? 8 : 9) / (1 + haste),
        charges:
          1 +
          (combatant.hasTalent(TALENTS.IMPROVED_RAGING_BLOW_TALENT) ? 1 : 0) +
          (combatant.hasTalent(TALENTS.RAGING_ARMAMENTS_TALENT) ? 1 : 0),
        gcd: {
          base: 1500,
        },
      },
      {
        enabled: combatant.hasTalent(talents.BLOODTHIRST_TALENT),
        spell: SPELLS.BLOODTHIRST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [SPELLS.EXECUTE_FURY.id, SPELLS.EXECUTE_FURY_MASSACRE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
        enabled: !false,
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
        enabled: combatant.hasTalent(talents.IMPENDING_VICTORY_TALENT),
        spell: SPELLS.IMPENDING_VICTORY_TALENT_HEAL.id,
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        enabled: !combatant.hasTalent(talents.IMPENDING_VICTORY_TALENT),
        spell: SPELLS.VICTORY_RUSH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.THUNDER_CLAP.id,
        enabled: combatant.hasTalent(talents.THUNDER_CLAP_SHARED_TALENT),
        category: SPELL_CATEGORY.OTHERS,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      // Cooldown
      {
        spell: SPELLS.RECKLESSNESS.id,
        enabled: combatant.hasTalent(talents.RECKLESSNESS_TALENT),
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
        spell: talents.RAVAGER_TALENT.id,
        enabled: combatant.hasTalent(talents.RAVAGER_TALENT),
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
        spell: talents.AVATAR_SHARED_TALENT.id,
        enabled: combatant.hasTalent(talents.AVATAR_SHARED_TALENT),
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
        enabled: combatant.hasTalent(talents.THUNDEROUS_ROAR_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90 - (combatant.hasTalent(TALENTS.UPROAR_TALENT) ? 30 : 0),
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
        spell: TALENTS.SPEAR_OF_BASTION_TALENT.id,
        enabled: combatant.hasTalent(talents.SPEAR_OF_BASTION_TALENT),
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
      // Defensive
      {
        spell: SPELLS.SPELL_REFLECTION.id,
        enabled: combatant.hasTalent(talents.SPELL_REFLECTION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.SPELL_REFLECTION.id,
        cooldown: 25,
        gcd: null,
      },
      {
        spell: SPELLS.ENRAGED_REGENERATION.id,
        enabled: combatant.hasTalent(talents.ENRAGED_REGENERATION_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.ENRAGED_REGENERATION.id,
        cooldown: 120,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          extraSuggestion: 'Use it to reduce damage taken for a short period.',
        },
      },
      {
        spell: TALENTS.BITTER_IMMUNITY_TALENT.id,
        enabled: combatant.hasTalent(talents.BITTER_IMMUNITY_TALENT),
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: TALENTS.BITTER_IMMUNITY_TALENT.id,
        cooldown: 3 * 60,
        gcd: null,
      },
      {
        spell: SPELLS.RALLYING_CRY.id,
        enabled: combatant.hasTalent(talents.RALLYING_CRY_TALENT),
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
        cooldown: 20 - (combatant.hasTalent(talents.DOUBLE_TIME_TALENT) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(talents.DOUBLE_TIME_TALENT) ? 1 : 0),
      },
      {
        spell: SPELLS.HEROIC_LEAP.id,
        enabled: combatant.hasTalent(talents.HEROIC_LEAP_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: SPELLS.BOUNDING_STRIDE_BUFF.id,
        cooldown: 45 - (combatant.hasTalent(talents.BOUNDING_STRIDE_TALENT) ? 15 : 0),
        charges: 1,
        gcd: null,
      },
      {
        spell: SPELLS.INTERVENE_CAST.id,
        enabled: combatant.hasTalent(talents.INTERVENE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: null,
      },
      {
        spell: talents.STORM_BOLT_TALENT.id,
        enabled: combatant.hasTalent(talents.STORM_BOLT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
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
        enabled: combatant.hasTalent(talents.SHOCKWAVE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 40,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        enabled: combatant.hasTalent(talents.BERSERKER_RAGE_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: SPELLS.BERSERKER_RAGE.id,
        cooldown: 60,
        gcd: null,
      },
      {
        spell: talents.BERSERKER_SHOUT_TALENT.id,
        enabled: combatant.hasTalent(talents.BERSERKER_SHOUT_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: talents.BERSERKER_SHOUT_TALENT.id,
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
        spell: TALENTS.TITANIC_THROW_TALENT.id,
        enabled: combatant.hasTalent(talents.TITANIC_THROW_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.WRECKING_THROW_TALENT.id,
        enabled: combatant.hasTalent(talents.WRECKING_THROW_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHATTERING_THROW.id,
        enabled: combatant.hasTalent(talents.SHATTERING_THROW_TALENT),
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
    ];
  }
}

export default Abilities;
