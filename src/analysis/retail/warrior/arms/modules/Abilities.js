import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
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
        cooldown: (haste) => 6 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false, // Suggestions are in MortalStrike.js
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.OVERPOWER.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12,
        charges: 1 + (combatant.hasTalent(SPELLS.DREADNAUGHT_TALENT) ? 1 : 0),
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
        spell: SPELLS.REND_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.REND_TALENT),
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
        enabled: !combatant.hasTalent(SPELLS.WARBREAKER_TALENT),
      },
      {
        spell: SPELLS.SKULLSPLITTER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 21 / (1 + haste),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SKULLSPLITTER_TALENT),
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
        spell: [SPELLS.CONDEMN.id, SPELLS.CONDEMN_MASSACRE.id],
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: false,
      },
      // Rotational AOE
      {
        spell: SPELLS.WARBREAKER_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.WARBREAKER_TALENT), // replaces Colussus Smash
      },
      {
        spell: SPELLS.CLEAVE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: (haste) => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6, // I don't know at what efficiency this talent becomes worth it so I'm keeping it save
        },
        enabled: combatant.hasTalent(SPELLS.CLEAVE_TALENT),
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
        enabled: !combatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS),
        buffSpellId: SPELLS.BLADESTORM.id,
      },
      {
        spell: SPELLS.RAVAGER_TALENT_ARMS.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS), // Replaces Bladestorm
      },
      {
        spell: SPELLS.ANCIENT_AFTERSHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: false,
      },
      {
        spell: SPELLS.SPEAR_OF_BASTION.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: false,
      },
      // Others
      {
        spell: SPELLS.VICTORY_RUSH.id,
        category: SPELL_CATEGORY.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT),
      },
      {
        spell: SPELLS.IMPENDING_VICTORY_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT), // Replaces Victory Rush
      },
      // Cooldowns
      {
        spell: SPELLS.AVATAR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 90,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.AVATAR_TALENT),
      },
      {
        spell: SPELLS.DEADLY_CALM_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.DEADLY_CALM_TALENT),
        buffSpellId: SPELLS.DEADLY_CALM_TALENT.id,
      },
      {
        spell: SPELLS.CONQUERORS_BANNER.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: false,
      },
      // Defensive
      {
        spell: SPELLS.DEFENSIVE_STANCE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 6,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.DEFENSIVE_STANCE_TALENT),
        buffSpellId: SPELLS.DEFENSIVE_STANCE_TALENT.id,
      },
      {
        spell: SPELLS.DIE_BY_THE_SWORD.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.4,
        },
        buffSpellId: SPELLS.DIE_BY_THE_SWORD.id,
      },
      {
        spell: SPELLS.SPELL_REFLECTION.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 25,
        gcd: null,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.4,
        },
        buffSpellId: SPELLS.SPELL_REFLECTION.id,
      },
      {
        spell: SPELLS.IGNORE_PAIN.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        buffSpellId: SPELLS.IGNORE_PAIN.id,
        gcd: null,
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
        buffSpellId: SPELLS.RALLYING_CRY_BUFF.id,
      },
      // Utility
      {
        spell: SPELLS.CHARGE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 20 - (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT) ? 1 : 0),
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
        cooldown: 45 - (combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT) ? 15 : 0),
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.01,
          extraSuggestion:
            'Use it to escape mechanics at the last moment, allowing you more time to DPS.',
        },
      },
      {
        spell: SPELLS.STORM_BOLT_TALENT.id,
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
        enabled: combatant.hasTalent(SPELLS.STORM_BOLT_TALENT),
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
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
