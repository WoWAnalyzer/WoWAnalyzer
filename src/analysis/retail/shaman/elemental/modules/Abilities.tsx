import SPELLS from 'common/SPELLS';
import { TALENTS_SHAMAN } from 'common/TALENTS/shaman';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: TALENTS_SHAMAN.LAVA_BURST_TALENT.id,
        charges: combatant.hasTalent(TALENTS_SHAMAN.ECHO_OF_THE_ELEMENTS_TALENT.id) ? 2 : 1,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.LAVA_BURST_TALENT.id),
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
        spell: TALENTS_SHAMAN.LIQUID_MAGMA_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.LIQUID_MAGMA_TOTEM_TALENT.id),
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
        spell: TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.CHAIN_LIGHTNING_TALENT.id),
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
        spell: TALENTS_SHAMAN.EARTHQUAKE_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.EARTHQUAKE_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_SHAMAN.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 12,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: TALENTS_SHAMAN.ASCENDANCE_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.ASCENDANCE_ELEMENTAL_TALENT.id),
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
        spell: TALENTS_SHAMAN.FIRE_ELEMENTAL_TALENT.id,
        enabled: !combatant.hasTalent(TALENTS_SHAMAN.STORM_ELEMENTAL_TALENT.id),
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
        spell: TALENTS_SHAMAN.STORMKEEPER_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.STORMKEEPER_ELEMENTAL_TALENT.id),
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
        spell: TALENTS_SHAMAN.STORM_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.STORM_ELEMENTAL_TALENT.id),
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
        spell: TALENTS_SHAMAN.FROST_SHOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.FROST_SHOCK_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_SHAMAN.ICEFURY_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.ICEFURY_TALENT.id),
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
        spell: TALENTS_SHAMAN.EARTH_SHOCK_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.EARTH_SHOCK_TALENT.id),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_SHAMAN.CAPACITOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.CAPACITOR_TOTEM_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60, //misses Static Charge CDR
      },
      {
        spell: TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT.id,
        buffSpellId: TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.ASTRAL_SHIFT_TALENT.id),
        cooldown: 90,
        category: SPELL_CATEGORY.DEFENSIVE,
      },
      {
        spell: TALENTS_SHAMAN.THUNDERSTORM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.THUNDERSTORM_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
        },
        cooldown: 45,
      },
      {
        spell: TALENTS_SHAMAN.TREMOR_TOTEM_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.TREMOR_TOTEM_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS_SHAMAN.WIND_SHEAR_TALENT.id,
        enabled: combatant.hasTalent(TALENTS_SHAMAN.WIND_SHEAR_TALENT.id),
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 12,
        gcd: null,
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
