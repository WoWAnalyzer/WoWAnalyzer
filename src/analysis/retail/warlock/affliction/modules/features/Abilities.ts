import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import SharedAbilities from 'analysis/retail/warlock/shared/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends SharedAbilities {
  spellbook(): SpellbookAbility[] {
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
        enabled: combatant.hasTalent(TALENTS.HAUNT_TALENT),
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
        enabled: !combatant.hasTalent(TALENTS.WITHER_TALENT),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.CORRUPTION_DEBUFF.id,
      },
      {
        spell: SPELLS.WITHER_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.WITHER_TALENT),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.CORRUPTION_DEBUFF.id,
      },
      {
        spell: TALENTS.SIPHON_LIFE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.SIPHON_LIFE_TALENT),
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
        spell: SPELLS.DRAIN_SOUL_DEBUFF.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.DRAIN_SOUL_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.PHANTOM_SINGULARITY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.PHANTOM_SINGULARITY_TALENT),
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
        enabled: combatant.hasTalent(TALENTS.SEED_OF_CORRUPTION_TALENT),
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
        enabled: combatant.hasTalent(TALENTS.VILE_TAINT_TALENT),
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
        enabled: combatant.hasTalent(TALENTS.SOUL_ROT_TALENT),
        cooldown: 40,
        castEfficiency: {
          suggestion: false,
        },
      },
      {
        spell: SPELLS.MALEVOLENCE.id,
        buffSpellId: SPELLS.MALEVOLENCE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.MALEVOLENCE_TALENT),
        cooldown: 60,
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
        enabled: combatant.hasTalent(TALENTS.SUMMON_DARKGLARE_TALENT),
      },

      // Utility
      {
        spell: TALENTS.BURNING_RUSH_TALENT.id,
        buffSpellId: TALENTS.BURNING_RUSH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.BURNING_RUSH_TALENT),
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
        enabled: combatant.hasTalent(TALENTS.MORTAL_COIL_TALENT),
        gcd: {
          base: 1500,
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
        enabled: combatant.hasTalent(TALENTS.GRIMOIRE_OF_SACRIFICE_TALENT),
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
        enabled: !combatant.hasTalent(TALENTS.CURSE_OF_THE_SATYR_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CURSE_OF_THE_SATYR.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.CURSE_OF_THE_SATYR_TALENT),
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
        cooldown: combatant.hasTalent(TALENTS.DARKFURY_TALENT) ? 45 : 60,
      },
      {
        spell: SPELLS.UNENDING_BREATH.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.HOWL_OF_TERROR_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.HOWL_OF_TERROR_TALENT),
        cooldown: 40,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.IMP_SINGE_MAGIC.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 15,
        gcd: null,
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;
