import SPELLS from 'common/SPELLS';
import covenantSpells from 'common/SPELLS/shadowlands/covenants/'
import TALENTS from 'common/TALENTS/warlock';
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
        spell: TALENTS.UNSTABLE_AFFLICTION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        buffSpellId: TALENTS.UNSTABLE_AFFLICTION_TALENT.id,
      },
      {
        spell: TALENTS.HAUNT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 15,
        enabled: combatant.hasTalent(TALENTS.HAUNT_TALENT.id),
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
        buffSpellId: TALENTS.HAUNT_TALENT.id,
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
        spell: TALENTS.MALEFIC_RAPTURE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SIPHON_LIFE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.SIPHON_LIFE_TALENT.id),
        gcd: {
          base: 1500,
        },
        buffSpellId: TALENTS.SIPHON_LIFE_TALENT.id,
      },
      {
        spell: SPELLS.SHADOW_BOLT_AFFLI.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.DRAIN_SOUL_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.DRAIN_SOUL_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PHANTOM_SINGULARITY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.PHANTOM_SINGULARITY_TALENT.id),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
        buffSpellId: TALENTS.PHANTOM_SINGULARITY_TALENT.id,
      },
      {
        spell: TALENTS.SEED_OF_CORRUPTION_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        enabled: combatant.hasTalent(TALENTS.SEED_OF_CORRUPTION_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.VILE_TAINT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.VILE_TAINT_TALENT.id),
        cooldown: 20,
        castEfficiency: {
          suggestion: false,
        },
        buffSpellId: TALENTS.VILE_TAINT_TALENT.id,
      },
      {
        spell: TALENTS.SOUL_ROT_TALENT.id,
        buffSpellId: TALENTS.SOUL_ROT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SOUL_ROT_TALENT.id),
        // TODO: how to account for soul-eater's gluttony
        cooldown: 40,
        castEfficiency: {
          // TODO: make a good suggestion here.
          suggestion: false,
        },
      },
      // Cooldowns
      {
        spell: TALENTS.SUMMON_DARKGLARE_TALENT.id,
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
        spell: TALENTS.DARK_PACT_TALENT.id,
        buffSpellId: TALENTS.DARK_PACT_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        cooldown: 60,
        gcd: null,
        enabled: combatant.hasTalent(TALENTS.DARK_PACT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          importance: ISSUE_IMPORTANCE.MINOR,
          recommendedEfficiency: 0.33,
          averageIssueEfficiency: 0.2,
          majorIssueEfficiency: 0.1,
        },
      },
      // Utility
      {
        spell: TALENTS.BURNING_RUSH_TALENT.id,
        buffSpellId: TALENTS.BURNING_RUSH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.BURNING_RUSH_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DRAIN_LIFE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.MORTAL_COIL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.MORTAL_COIL_TALENT.id),
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
        spell: TALENTS.GRIMOIRE_OF_SACRIFICE_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.GRIMOIRE_OF_SACRIFICE_TALENT.id),
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
        spell: TALENTS.SHADOWFURY_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: combatant.hasTalent(TALENTS.DARKFURY_TALENT.id) ? 45 : 60,
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
        cooldown: () => 180 - combatant.getTalentRank(TALENTS.FEL_PACT_TALENT) * 30,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.HOWL_OF_TERROR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.HOWL_OF_TERROR_TALENT.id),
        cooldown: 40,
        gcd: {
          base: 1500,
        },
      },

      // Covenants
      {
        spell: covenantSpells.SCOURING_TITHE.id,
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
        spell: covenantSpells.DECIMATING_BOLT.id,
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
        buffSpellId: covenantSpells.DECIMATING_BOLT.id,
      },
      {
        spell: covenantSpells.SOULSHAPE.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 90,
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
        gcd: {
          base: 1500,
        },
        buffSpellId: covenantSpells.SOULSHAPE.id,
      },
      // this is the covenant spell soul rot, not the talent soul rot
      {
        spell: covenantSpells.SOUL_ROT.id,
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
        spell: covenantSpells.IMPENDING_CATASTROPHE_CAST.id,
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
          covenantSpells.IMPENDING_CATASTROPHE_HIT.id,
          covenantSpells.IMPENDING_CATASTROPHE_DEBUFF.id,
        ],
      },
    ];
  }
}

export default Abilities;
