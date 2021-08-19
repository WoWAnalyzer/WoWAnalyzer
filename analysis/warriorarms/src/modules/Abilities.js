import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational
      {
        spell: SPELLS.MORTAL_STRIKE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
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
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 12,
        charges: 1 + (combatant.hasTalent(SPELLS.DREADNAUGHT_TALENT.id) ? 1 : 0),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.OVERPOWER.id,
      },
      {
        spell: SPELLS.SLAM.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.REND_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.REND_TALENT.id),
      },
      {
        spell: SPELLS.COLOSSUS_SMASH.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: !combatant.hasTalent(SPELLS.WARBREAKER_TALENT.id),
      },
      {
        spell: SPELLS.SKULLSPLITTER_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: (haste) => 21 / (1 + haste),
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.SKULLSPLITTER_TALENT.id),
      },
      {
        spell: [SPELLS.EXECUTE.id, SPELLS.EXECUTE_GLYPHED.id],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      {
        spell: [SPELLS.CONDEMN.id, SPELLS.CONDEMN_MASSACRE.id],
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
      },
      // Rotational AOE
      {
        spell: SPELLS.WARBREAKER_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.WARBREAKER_TALENT.id), // replaces Colussus Smash
      },
      {
        spell: SPELLS.CLEAVE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: (haste) => 9 / (1 + haste),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6, // I don't know at what efficiency this talent becomes worth it so I'm keeping it save
        },
        enabled: combatant.hasTalent(SPELLS.CLEAVE_TALENT.id),
      },
      {
        spell: SPELLS.SWEEPING_STRIKES.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.SWEEPING_STRIKES.id,
      },
      {
        spell: SPELLS.WHIRLWIND.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLADESTORM.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: !combatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS.id),
        buffSpellId: SPELLS.BLADESTORM.id,
      },
      {
        spell: SPELLS.RAVAGER_TALENT_ARMS.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.7,
        },
        enabled: combatant.hasTalent(SPELLS.RAVAGER_TALENT_ARMS.id), // Replaces Bladestorm
      },
      {
        spell: SPELLS.ANCIENT_AFTERSHOCK.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },
      {
        spell: SPELLS.SPEAR_OF_BASTION.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
      },
      // Others
      {
        spell: SPELLS.VICTORY_RUSH.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id),
      },
      {
        spell: SPELLS.IMPENDING_VICTORY_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.IMPENDING_VICTORY_TALENT.id), // Replaces Victory Rush
      },
      // Cooldowns
      {
        spell: SPELLS.AVATAR_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.AVATAR_TALENT.id),
      },
      {
        spell: SPELLS.DEADLY_CALM_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.DEADLY_CALM_TALENT.id),
        buffSpellId: SPELLS.DEADLY_CALM_TALENT.id,
      },
      {
        spell: SPELLS.CONQUERORS_BANNER.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
      },
      // Defensive
      {
        spell: SPELLS.DEFENSIVE_STANCE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 6,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.DEFENSIVE_STANCE_TALENT.id),
        buffSpellId: SPELLS.DEFENSIVE_STANCE_TALENT.id,
      },
      {
        spell: SPELLS.DIE_BY_THE_SWORD.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.4,
        },
        buffSpellId: SPELLS.DIE_BY_THE_SWORD.id,
      },
      {
        spell: SPELLS.RALLYING_CRY.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
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
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 20 - (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 3 : 0),
        charges: 1 + (combatant.hasTalent(SPELLS.DOUBLE_TIME_TALENT.id) ? 1 : 0),
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
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        buffSpellId: SPELLS.BOUNDING_STRIDE_BUFF.id,
        cooldown: 45 - (combatant.hasTalent(SPELLS.BOUNDING_STRIDE_TALENT.id) ? 15 : 0),
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
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
        enabled: combatant.hasTalent(SPELLS.STORM_BOLT_TALENT.id),
      },
      {
        spell: SPELLS.PUMMEL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      {
        spell: SPELLS.BERSERKER_RAGE.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 60,
        gcd: null,
        buffSpellId: SPELLS.BERSERKER_RAGE.id,
      },
      {
        spell: SPELLS.HEROIC_THROW.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INTIMIDATING_SHOUT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAMSTRING.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BATTLE_SHOUT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.TAUNT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        gcd: null,
      },
    ];
  }
}

export default Abilities;
