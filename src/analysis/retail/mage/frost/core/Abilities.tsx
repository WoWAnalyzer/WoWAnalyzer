import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import CoreAbilities from 'analysis/retail/mage/shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook(): SpellbookAbility[] {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.FROSTBOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 1,
        damageSpellIds: [SPELLS.FROSTBOLT_DAMAGE.id],
      },
      {
        spell: TALENTS.ICE_LANCE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ICE_LANCE_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
        damageSpellIds: [SPELLS.ICE_LANCE_DAMAGE.id],
      },
      {
        spell: TALENTS.FLURRY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.FLURRY_TALENT),
        cooldown: 30,
        charges: 1 + combatant.getTalentRank(TALENTS.PERPETUAL_WINTER_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
        damageSpellIds: [SPELLS.FLURRY_DAMAGE.id],
      },
      {
        spell: TALENTS.GLACIAL_SPIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
        damageSpellIds: [SPELLS.GLACIAL_SPIKE_DAMAGE.id],
      },
      {
        spell: TALENTS.RAY_OF_FROST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 80,
        enabled: combatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT),
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 4, // Shares talent row with Glacial Spike
        //damageSpellIds: [SPELLS.RAY_OF_FROST.id], // needs verification
      },
      {
        spell: TALENTS.COMET_STORM_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        enabled: combatant.hasTalent(TALENTS.COMET_STORM_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 5,
        damageSpellIds: [SPELLS.COMET_STORM_DAMAGE.id],
      },
      {
        spell: SPELLS.BLIZZARD.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: (haste: any) => 8 / (1 + haste),
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 7,
        damageSpellIds: [SPELLS.BLIZZARD_DAMAGE.id],
      },

      // Cooldowns; start at sortindex 15
      {
        spell: TALENTS.FROZEN_ORB_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.FROZEN_ORB_TALENT),
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 15,
        damageSpellIds: [SPELLS.FROZEN_ORB_DAMAGE.id],
      },
      {
        spell: TALENTS.ICY_VEINS_TALENT.id,
        buffSpellId: TALENTS.ICY_VEINS_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        enabled: combatant.hasTalent(TALENTS.ICY_VEINS_TALENT),
        gcd: null,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 17,
      },

      //Utility
      {
        spell: SPELLS.COLD_SNAP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 300,
      },
      {
        spell: TALENTS.SUMMON_WATER_ELEMENTAL_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.SUMMON_WATER_ELEMENTAL_TALENT),
        cooldown: 30,
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;
