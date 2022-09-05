import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

const FEL_CELERITY_REDUCTION_SEC = [0, 48, 51, 54, 57, 60, 63, 66, 69, 72, 75, 78, 81, 84, 87, 90];

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.UNSTABLE_AFFLICTION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.UNSTABLE_AFFLICTION.id,
      },
      {
        spell: SPELLS.HAUNT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.HAUNT_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
          // TODO: possibly implement Haunt resets via SpellUsable?
          extraSuggestion:
            "This estimate may not be correct sometimes because of Haunt's resets. The real amount of possible Haunts will be higher if there were adds on this fight.",
        },
        buffSpellId: SPELLS.HAUNT_TALENT.id,
      },
      {
        spell: SPELLS.AGONY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.AGONY.id,
      },
      {
        spell: SPELLS.CORRUPTION_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.CORRUPTION_DEBUFF.id,
      },
      {
        spell: SPELLS.MALEFIC_RAPTURE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SIPHON_LIFE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.SIPHON_LIFE_TALENT.id),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.SIPHON_LIFE_TALENT.id,
      },
      {
        spell: SPELLS.SHADOW_BOLT_AFFLI.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DRAIN_SOUL_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.DRAIN_SOUL_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.PHANTOM_SINGULARITY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.PHANTOM_SINGULARITY_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
        buffSpellId: SPELLS.PHANTOM_SINGULARITY_TALENT.id,
      },
      {
        spell: SPELLS.SEED_OF_CORRUPTION_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.VILE_TAINT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.VILE_TAINT_TALENT.id),
        cooldown: 20,
        castEfficiency: {
          suggestion: false,
        },
        buffSpellId: SPELLS.VILE_TAINT_TALENT.id,
      },
      // Cooldowns
      {
        spell: SPELLS.SUMMON_DARKGLARE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.DARK_SOUL_MISERY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.DARK_SOUL_MISERY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        buffSpellId: SPELLS.DARK_SOUL_MISERY_TALENT.id,
      },

      // Defensive
      {
        spell: SPELLS.UNENDING_RESOLVE.id,
        buffSpellId: SPELLS.UNENDING_RESOLVE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 180,
        gcd: null,
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.33,
          averageIssueEfficiency: 0.2,
          majorIssueEfficiency: 0.1,
        },
      },
      {
        spell: SPELLS.DARK_PACT_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        gcd: null,
        enabled: combatant.hasTalent(SPELLS.DARK_PACT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.33,
          averageIssueEfficiency: 0.2,
          majorIssueEfficiency: 0.1,
        },
        buffSpellId: SPELLS.DARK_PACT_TALENT.id,
      },

      // Utility
      {
        spell: SPELLS.BURNING_RUSH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.BURNING_RUSH_TALENT.id),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.BURNING_RUSH_TALENT.id,
      },
      {
        spell: SPELLS.DRAIN_LIFE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MORTAL_COIL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.MORTAL_COIL_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_SUMMON.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 10,
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.DEMONIC_CIRCLE_TELEPORT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.SOULSTONE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEMONIC_GATEWAY_CAST.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 10,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.GRIMOIRE_OF_SACRIFICE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BANISH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CREATE_HEALTHSTONE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CREATE_SOULWELL.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 120,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SUBJUGATE_DEMON.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EYE_OF_KILROGG.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FEAR_CAST.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CURSE_OF_TONGUES.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CURSE_OF_WEAKNESS.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CURSE_OF_EXHAUSTION.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HEALTH_FUNNEL_CAST.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: [
          SPELLS.SUMMON_IMP.id,
          SPELLS.SUMMON_VOIDWALKER.id,
          SPELLS.SUMMON_SUCCUBUS.id,
          SPELLS.SUMMON_FELHUNTER.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SHADOWFURY.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(SPELLS.DARKFURY_TALENT.id) ? 45 : 60,
      },
      {
        spell: SPELLS.UNENDING_BREATH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FEL_DOMINATION.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: () =>
          180 -
          FEL_CELERITY_REDUCTION_SEC[combatant.conduitRankBySpellID(SPELLS.FEL_CELERITY.id) || 0],
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HOWL_OF_TERROR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(SPELLS.HOWL_OF_TERROR_TALENT.id),
        cooldown: 40,
        gcd: {
          base: 1500,
        },
      },

      // Covenants
      {
        spell: SPELLS.SCOURING_TITHE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.DECIMATING_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        buffSpellId: SPELLS.DECIMATING_BOLT.id,
      },
      {
        spell: SPELLS.SOULSHAPE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.SOULSHAPE.id,
      },
      {
        spell: SPELLS.SOUL_ROT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.IMPENDING_CATASTROPHE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 60,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        damageSpellIds: [
          SPELLS.IMPENDING_CATASTROPHE_HIT.id,
          SPELLS.IMPENDING_CATASTROPHE_DEBUFF.id,
        ],
      },
    ];
  }
}

export default Abilities;
