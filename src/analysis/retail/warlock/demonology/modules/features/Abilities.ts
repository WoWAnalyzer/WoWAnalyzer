import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import SharedAbilities from 'analysis/retail/warlock/shared/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends SharedAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.CALL_DREADSTALKERS.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 20,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.HAND_OF_GULDAN_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RUINATION_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INFERNAL_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.DEMONBOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
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
        spell: TALENTS.SOUL_STRIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 10,
        enabled: combatant.hasTalent(TALENTS.SOUL_STRIKE_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.SUMMON_VILEFIEND_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled:
          combatant.hasTalent(TALENTS.SUMMON_VILEFIEND_TALENT) &&
          !combatant.hasTalent(TALENTS.MARK_OF_FHARG_TALENT) &&
          !combatant.hasTalent(TALENTS.MARK_OF_SHATUG_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.CHARHOUND_SUMMON.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.MARK_OF_FHARG_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.GLOOMHOUND_SUMMON.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.MARK_OF_SHATUG_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.DOOM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.DOOM_TALENT),
        buffSpellId: TALENTS.DOOM_TALENT.id,
      },
      {
        spell: SPELLS.SHADOW_BOLT_DEMO.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      // TODO: figure which spell triggers this now
      // {
      //   spell: SPELLS.FELSTORM.id,
      //   category: SPELL_CATEGORY.ROTATIONAL,
      //   cooldown: 45,
      //   gcd: null,
      // },
      {
        spell: TALENTS.BILESCOURGE_BOMBERS_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.BILESCOURGE_BOMBERS_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.IMPLOSION_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },

      // Cooldowns
      {
        spell: SPELLS.SUMMON_DEMONIC_TYRANT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.POWER_SIPHON_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.POWER_SIPHON_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.GRIMOIRE_FELGUARD_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 120,
        enabled: combatant.hasTalent(TALENTS.GRIMOIRE_FELGUARD_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.7,
        },
      },
      {
        spell: TALENTS.DEMONIC_STRENGTH_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.DEMONIC_STRENGTH_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.GUILLOTINE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.GUILLOTINE_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
          averageIssueEfficiency: 0.8,
          majorIssueEfficiency: 0.7,
        },
      },

      // Utility
      {
        spell: TALENTS.BURNING_RUSH_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.BURNING_RUSH_TALENT),
        gcd: {
          base: 1500,
        },
        buffSpellId: TALENTS.BURNING_RUSH_TALENT.id,
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
          SPELLS.SUMMON_FELGUARD.id,
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
      ...super.spellbook(),
    ];
  }
}

export default Abilities;
