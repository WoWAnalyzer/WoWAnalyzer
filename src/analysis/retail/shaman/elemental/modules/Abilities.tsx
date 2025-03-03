import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import ClassAbilities from '../../shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends ClassAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      ...super.spellbook(),
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
        spell: SPELLS.PRIMORDIAL_WAVE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.PRIMORDIAL_WAVE_TALENT),
        gcd: {
          base: 1500,
        },
        range: 40,
      },
      {
        spell: SPELLS.ICEFURY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ICEFURY_TALENT),
        gcd: {
          base: 1500,
        },
        range: 40,
      },
      {
        spell: SPELLS.LAVA_BEAM.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
      },
      {
        spell: [TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT.id, TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT.id],
        enabled:
          combatant.hasTalent(TALENTS.EARTHQUAKE_1_ELEMENTAL_TALENT) ||
          combatant.hasTalent(TALENTS.EARTHQUAKE_2_ELEMENTAL_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT.id,
        enabled: combatant.hasTalent(TALENTS.ELEMENTAL_BLAST_ELEMENTAL_TALENT),
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
        cooldown: 180 - (combatant.hasTalent(TALENTS.FIRST_ASCENDANT_TALENT) ? 60 : 0),
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
        spell: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        enabled: combatant.hasTalent(TALENTS.STORMKEEPER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        charges: 1,
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
        gcd: {
          base: 1500,
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
        spell: SPELLS.ANCESTRAL_SWIFTNESS_CAST.id,
        enabled: combatant.hasTalent(TALENTS.ANCESTRAL_SWIFTNESS_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        cooldown: 30,
        gcd: {
          static: 0,
        },
      },
      {
        spell: SPELLS.TEMPEST_CAST.id,
        enabled: combatant.hasTalent(TALENTS.TEMPEST_TALENT),
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
