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
        charges: combatant.hasTalent(TALENTS.ECHO_OF_THE_ELEMENTS_TALENT.id) ? 2 : 1,
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
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        enabled: combatant.hasTalent(TALENTS.LIQUID_MAGMA_TOTEM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.CHAIN_LIGHTNING_TALENT.id,
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
        spell: SPELLS.EARTHQUAKE.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id),
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
        spell: TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ASCENDANCE_ELEMENTAL_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.FIRE_ELEMENTAL.id,
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
        enabled: !combatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: TALENTS.STORMKEEPER_ELEMENTAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.STORMKEEPER_ELEMENTAL_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.STORM_ELEMENTAL_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 60 * 2.5,
        enabled: combatant.hasTalent(TALENTS.STORM_ELEMENTAL_TALENT.id),
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
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ICEFURY_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ICEFURY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.EARTH_SHOCK.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.CAPACITOR_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.ICEFURY_TALENT.id),
        cooldown: 60, //misses Static Charge CDR
      },
      {
        spell: TALENTS.ASTRAL_SHIFT_TALENT.id,
        buffSpellId: TALENTS.ASTRAL_SHIFT_TALENT.id,
        cooldown: 90,
        enabled: combatant.hasTalent(TALENTS.ASTRAL_SHIFT_TALENT.id),
        category: SPELL_CATEGORY.DEFENSIVE,
      },
      {
        spell: TALENTS.THUNDERSTORM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1000,
        },
        cooldown: 45,
      },
      {
        spell: TALENTS.TREMOR_TOTEM_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.WIND_SHEAR_TALENT.id,
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
