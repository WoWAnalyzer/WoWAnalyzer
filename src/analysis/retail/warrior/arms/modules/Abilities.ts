import SPELLS from 'common/SPELLS';
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
        spell: SPELLS.MORTAL_STRIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste: number) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false, // Suggestions are in MortalStrike.tsx
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.OVERPOWER.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12,
        charges: 1 + (combatant.hasTalent(TALENTS.IMPROVED_OVERPOWER_TALENT) ? 1 : 0),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.OVERPOWER.id,
        castEfficiency: {
          suggestion: false, // Suggestions are in OverPower.js
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.SLAM.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.REND_ARMS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.REND_ARMS_TALENT),
      },
      {
        spell: SPELLS.COLOSSUS_SMASH.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: !combatant.hasTalent(TALENTS.WARBREAKER_TALENT),
      },
      {
        spell: TALENTS.SKULLSPLITTER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 21,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SKULLSPLITTER_TALENT),
      },
      {
        spell: [SPELLS.EXECUTE.id, SPELLS.EXECUTE_GLYPHED.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: !false,
      },
      {
        spell: TALENTS.DEMOLISH_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(TALENTS.DEMOLISH_TALENT),
      },
      // Rotational AOE
      {
        spell: TALENTS.WARBREAKER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(TALENTS.WARBREAKER_TALENT), // replaces Colussus Smash
      },
      {
        spell: TALENTS.CLEAVE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: (haste: number) => 4.5 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6, // I don't know at what efficiency this talent becomes worth it so I'm keeping it save
        },
        enabled: combatant.hasTalent(TALENTS.CLEAVE_TALENT),
      },
      {
        spell: SPELLS.SWEEPING_STRIKES.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 750,
        },
        buffSpellId: SPELLS.SWEEPING_STRIKES.id,
      },
      {
        spell: TALENTS.THUNDEROUS_ROAR_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 90 - (combatant.hasTalent(TALENTS.UPROAR_TALENT) ? 45 : 0),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.THUNDEROUS_ROAR_TALENT),
      },
      {
        spell: SPELLS.WHIRLWIND.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLADESTORM.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false, // Suggestions are in Bladestorm.js
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(TALENTS.BLADESTORM_TALENT),
        buffSpellId: SPELLS.BLADESTORM.id,
      },
      {
        spell: TALENTS.CHAMPIONS_SPEAR_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(TALENTS.CHAMPIONS_SPEAR_TALENT),
      },
      {
        spell: SPELLS.THUNDER_CLAP.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.THUNDER_CLAP_TALENT),
      },
      // Others
      {
        spell: SPELLS.VICTORY_RUSH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT),
      },
      {
        spell: TALENTS.IMPENDING_VICTORY_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 25,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.IMPENDING_VICTORY_TALENT), // Replaces Victory Rush
      },
      // Cooldowns
      {
        spell: TALENTS.AVATAR_SHARED_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(TALENTS.AVATAR_SHARED_TALENT),
      },
      // Defensive
      {
        spell: TALENTS.DEFENSIVE_STANCE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 3,
        gcd: null,
        buffSpellId: TALENTS.DEFENSIVE_STANCE_TALENT.id,
      },
      {
        spell: SPELLS.DIE_BY_THE_SWORD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown:
          (combatant.hasTalent(TALENTS.VALOR_IN_VICTORY_TALENT) ? 90 : 120) *
          (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        gcd: null,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.4,
        },
        enabled: combatant.hasTalent(TALENTS.DIE_BY_THE_SWORD_TALENT),
        buffSpellId: SPELLS.DIE_BY_THE_SWORD.id,
      },
      {
        spell: SPELLS.SPELL_REFLECTION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 25 * (combatant.hasTalent(TALENTS.HONED_REFLEXES_TALENT) ? 0.95 : 1),
        gcd: null,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.4,
        },
        enabled: combatant.hasTalent(TALENTS.SPELL_REFLECTION_TALENT),
        buffSpellId: SPELLS.SPELL_REFLECTION.id,
      },
      {
        spell: SPELLS.IGNORE_PAIN.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 1,
        buffSpellId: SPELLS.IGNORE_PAIN.id,
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.IGNORE_PAIN_TALENT),
      },
      {
        spell: SPELLS.RALLYING_CRY.id,
        category: SPELL_CATEGORY.DEFENSIVE,
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
        enabled: combatant.hasTalent(TALENTS.RALLYING_CRY_TALENT),
        buffSpellId: SPELLS.RALLYING_CRY_BUFF.id,
      },
      // Utility
      {
        spell: TALENTS.WRECKING_THROW_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.WRECKING_THROW_TALENT),
      },
      {
        spell: TALENTS.SHATTERING_THROW_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SHATTERING_THROW_TALENT),
      },
      {
        spell: SPELLS.CHARGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20 - (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(TALENTS.DOUBLE_TIME_TALENT) ? 1 : 0),
        gcd: null, // Off gcd since 8.1
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion:
            'Use it to get back into range after moving out to avoid mechanics. Not only does this allow you to get back to DPSing faster, it also generates rage for you to DPS with.',
        },
      },
      {
        spell: SPELLS.HEROIC_LEAP.id,
        category: SPELL_CATEGORY.UTILITY,
        buffSpellId: SPELLS.BOUNDING_STRIDE_BUFF.id,
        cooldown: 45 - (combatant.hasTalent(TALENTS.BOUNDING_STRIDE_TALENT) ? 15 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion:
            'Use it to escape mechanics at the last moment, allowing you more time to DPS.',
        },
        enabled: combatant.hasTalent(TALENTS.HEROIC_LEAP_TALENT),
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
        enabled: combatant.hasTalent(TALENTS.STORM_BOLT_TALENT),
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
        cooldown: 60,
        gcd: null,
        buffSpellId: SPELLS.BERSERKER_RAGE.id,
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
        spell: SPELLS.INTIMIDATING_SHOUT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.INTIMIDATING_SHOUT_TALENT),
      },
      {
        spell: SPELLS.PIERCING_HOWL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.PIERCING_HOWL_TALENT),
      },
      {
        spell: SPELLS.HAMSTRING.id,
        category: SPELL_CATEGORY.UTILITY,
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
