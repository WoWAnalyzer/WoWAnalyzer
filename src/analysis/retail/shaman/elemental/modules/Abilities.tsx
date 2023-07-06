import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS.LAVA_BURST_TALENT.id,
        charges: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT) ? 2 : 1,
        enabled: combatant.hasTalent(TALENTS.LAVA_BURST_TALENT),
        cooldown: (haste) => 8 / (1 + haste),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.LIQUID_MAGMA_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.LIQUID_MAGMA_TOTEM_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.CHAIN_LIGHTNING_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CHAIN_LIGHTNING_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE, // 2 / (1 + haste)
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LAVA_BEAM.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
      },
      {
        spell: TALENTS.EARTHQUAKE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTHQUAKE_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ELEMENTAL_BLAST_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ELEMENTAL_BLAST_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.FIRE_ELEMENTAL_TALENT.id,
        enabled: !combatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 * 2.5,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [
          SPELLS.FIRE_BLAST.id,
          SPELLS.METEOR_DAMAGE.id,
          SPELLS.FIRE_ELEMENTAL_IMMOLATE.id,
        ],
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        charges: combatant.getRepeatedTalentCount(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT),
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
        spell: TALENTS.STORM_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 * 2.5,
        damageSpellIds: [SPELLS.WIND_GUST.id, SPELLS.EYE_OF_THE_STORM.id, SPELLS.CALL_LIGHTNING.id],
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },

      {
        spell: SPELLS.FLAME_SHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.FROST_SHOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.FROST_SHOCK_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ICEFURY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ICEFURY_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: TALENTS.EARTH_SHOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.EARTH_SHOCK_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CAPACITOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.CAPACITOR_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60, //misses Static Charge CDR
      },
      {
        spell: TALENTS.ASTRAL_SHIFT_TALENT.id,
        buffSpellId: TALENTS.ASTRAL_SHIFT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ASTRAL_SHIFT_TALENT),
        cooldown: combatant.hasTalent(TALENTS.PLANES_TRAVELER_TALENT) ? 90 : 120,
        category: SPELL_CATEGORY.DEFENSIVE,
      },
      {
        spell: TALENTS.THUNDERSTORM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.THUNDERSTORM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
        },
        cooldown: 45,
      },
      {
        spell: TALENTS.TREMOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.TREMOR_TOTEM_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.WIND_SHEAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.WIND_SHEAR_TALENT),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 12,
        gcd: null,
      },
      {
        spell: TALENTS.NATURES_SWIFTNESS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.NATURES_SWIFTNESS_TALENT),
        cooldown: 60,
        gcd: null,
      },
      {
        spell: TALENTS.GUST_OF_WIND_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS.GUST_OF_WIND_TALENT),
      },
      {
        spell: TALENTS.ANCESTRAL_GUIDANCE_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.ANCESTRAL_GUIDANCE_TALENT),
        cooldown: 120,
      },
      {
        spell: TALENTS.EARTH_ELEMENTAL_TALENT.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        enabled: combatant.hasTalent(TALENTS.EARTH_ELEMENTAL_TALENT),
        cooldown: 300,
      },
      {
        spell: TALENTS.SPIRITWALKERS_GRACE_TALENT.id,
        category: SPELL_CATEGORY.OTHERS,
        enabled: combatant.hasTalent(TALENTS.SPIRITWALKERS_GRACE_TALENT),
        cooldown: combatant.hasTalent(TALENTS.GRACEFUL_SPIRIT_TALENT) ? 90 : 120,
      },
      {
        spell: SPELLS.GHOST_WOLF.id,
        category: SPELL_CATEGORY.OTHERS,
      },
      {
        spell: SPELLS.BLOODLUST.id,
        category: SPELL_CATEGORY.COOLDOWNS,
      },
      {
        spell: SPELLS.HEROISM.id,
        category: SPELL_CATEGORY.COOLDOWNS,
      },
      {
        spell: SPELLS.REINCARNATION.id,
        category: SPELL_CATEGORY.OTHERS,
      },
    ];
  }
}

export default Abilities;
