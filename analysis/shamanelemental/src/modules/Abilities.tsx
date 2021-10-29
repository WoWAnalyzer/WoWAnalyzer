import SPELLS from 'common/SPELLS';
import CoreAbilities from 'parser/core/modules/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      {
        spell: SPELLS.LAVA_BURST.id,
        charges: combatant.hasTalent(SPELLS.ECHO_OF_THE_ELEMENTS_TALENT_ELEMENTAL.id) ? 2 : 1,
        cooldown: (haste) => 8 / (1 + haste),
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIGHTNING_BOLT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        enabled: combatant.hasTalent(SPELLS.LIQUID_MAGMA_TOTEM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.CHAIN_LIGHTNING.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE, // 2 / (1 + haste)
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.LAVA_BEAM.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.EARTHQUAKE.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ELEMENTAL_BLAST_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id),
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
        spell: SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ASCENDANCE_TALENT_ELEMENTAL.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.FIRE_ELEMENTAL.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60 * 2.5,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [
          SPELLS.FIRE_BLAST.id,
          SPELLS.METEOR_DAMAGE.id,
          SPELLS.FIRE_ELEMENTAL_IMMOLATE.id,
        ],
        enabled: !combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 1.0,
        },
      },
      {
        spell: SPELLS.STORMKEEPER_TALENT_ELEMENTAL.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.STORMKEEPER_TALENT_ELEMENTAL.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.STORM_ELEMENTAL_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60 * 2.5,
        enabled: combatant.hasTalent(SPELLS.STORM_ELEMENTAL_TALENT.id),
        damageSpellIds: [SPELLS.WIND_GUST.id, SPELLS.EYE_OF_THE_STORM.id, SPELLS.CALL_LIGHTNING.id],
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },

      {
        spell: SPELLS.FLAME_SHOCK.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 6,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FROST_SHOCK.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ICEFURY_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.ICEFURY_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.8,
        },
      },
      {
        spell: SPELLS.EARTH_SHOCK.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CAPACITOR_TOTEM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 60, //misses Static Charge CDR
      },
      {
        spell: SPELLS.ASTRAL_SHIFT.id,
        buffSpellId: SPELLS.ASTRAL_SHIFT.id,
        cooldown: 90,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
      },
      {
        spell: SPELLS.THUNDERSTORM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1000,
        },
        cooldown: 45,
      },
      {
        spell: SPELLS.TREMOR_TOTEM.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.WIND_SHEAR.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 12,
        gcd: null,
      },
      {
        spell: SPELLS.STATIC_DISCHARGE_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.STATIC_DISCHARGE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ECHOING_SHOCK_TALENT.id,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        enabled: combatant.hasTalent(SPELLS.ECHOING_SHOCK_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLOODLUST.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.HEROISM.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      },
      {
        spell: SPELLS.REINCARNATION.id,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
    ];
  }
}

export default Abilities;
