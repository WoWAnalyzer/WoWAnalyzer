import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import SharedAbilities from 'analysis/retail/warlock/shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends SharedAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.CHAOS_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.RUINATION_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.DIABOLIC_RITUAL_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CHANNEL_DEMONFIRE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 25 / (1 + haste),
        enabled: combatant.hasTalent(TALENTS.CHANNEL_DEMONFIRE_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
        },
      },
      {
        spell: SPELLS.CONFLAGRATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 13 / (1 + haste),
        charges: 2,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.95,
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
        spell: TALENTS.SOUL_FIRE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.SOUL_FIRE_TALENT),
        cooldown: 45, // TODO: further shortened via spending soul shards
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.SHADOWBURN_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: (haste) => 12 / (1 + haste),
        charges: 2,
        enabled: combatant.hasTalent(TALENTS.SHADOWBURN_TALENT),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        buffSpellId: TALENTS.SHADOWBURN_TALENT.id,
      },
      {
        spell: SPELLS.IMMOLATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: !combatant.hasTalent(TALENTS.WITHER_TALENT),
        gcd: {
          base: 1500,
        },
        buffSpellId: SPELLS.IMMOLATE_DEBUFF.id,
      },
      {
        spell: SPELLS.WITHER_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.WITHER_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INCINERATE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INFERNAL_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.DIABOLIC_RITUAL_TALENT),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.HAVOC.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: false,
        },
        buffSpellId: SPELLS.HAVOC.id,
      },
      {
        spell: SPELLS.RAIN_OF_FIRE_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CATACLYSM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.CATACLYSM_TALENT),
        castEfficiency: {
          suggestion: false,
        },
      },

      // Cooldowns
      {
        spell: SPELLS.SUMMON_INFERNAL.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
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
        spell: SPELLS.SHADOWFURY.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: combatant.hasTalent(TALENTS.DARKFURY_TALENT) ? 45 : 60,
        gcd: {
          base: 1500,
        },
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
