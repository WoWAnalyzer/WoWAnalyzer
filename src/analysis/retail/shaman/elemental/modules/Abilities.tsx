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
        spell: SPELLS.STORMKEEPER_BUFF_AND_CAST.id,
        enabled: combatant.hasTalent(TALENTS.STORMKEEPER_TALENT),
        category: SPELL_CATEGORY.COOLDOWNS,
        charges: 1,
        cooldown:
          60 -
          (combatant.hasTalent(TALENTS.HERALD_OF_THE_STORMS_TALENT) ? 15 : 0) -
          (combatant.hasTalent(TALENTS.ROLLING_THUNDER_TALENT) ? 15 : 0),
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
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
