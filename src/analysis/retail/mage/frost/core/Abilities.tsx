import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import CoreAbilities from 'analysis/retail/mage/shared/Abilities';
import { SpellbookAbility } from 'parser/core/modules/Ability';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';
import { hastedCooldown } from 'common/abilitiesConstants';

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
        spell: SPELLS.GLACIAL_SPIKE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.ICICLES_TALENT),
        // TODO some sort of analyzer ensuring you cast glacial spikes when available
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
        damageSpellIds: [SPELLS.GLACIAL_SPIKE_DAMAGE.id],
      },
      {
        spell: TALENTS.FLURRY_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.FLURRY_TALENT),
        cooldown: hastedCooldown(30),
        charges: 2,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 4,
        damageSpellIds: [SPELLS.FLURRY_DAMAGE.id],
      },
      {
        spell: TALENTS.RAY_OF_FROST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        charges: combatant.hasTalent(TALENTS.HAND_OF_FROST_3_FROST_TALENT) ? 2 : 1,
        enabled: combatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT),
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 5,
        //damageSpellIds: [SPELLS.RAY_OF_FROST.id], // needs verification
      },
      {
        spell: SPELLS.COMET_STORM_CAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 60, // TODO This CD (and charges) is incorrect, needs to be linked to ray of frost cast
        charges: combatant.hasTalent(TALENTS.HAND_OF_FROST_3_FROST_TALENT) ? 2 : 1,
        enabled: combatant.hasTalent(TALENTS.COMET_STORM_TALENT),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 6,
        damageSpellIds: [SPELLS.COMET_STORM_DAMAGE.id],
      },
      {
        spell: SPELLS.BLIZZARD.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        cooldown: hastedCooldown(12),
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
      //Utility
      {
        spell: SPELLS.COLD_SNAP.id,
        category: SPELL_CATEGORY.UTILITY,
        enabled: combatant.hasTalent(TALENTS.COLD_SNAP_TALENT),
        gcd: null,
        cooldown: 300,
      },
      ...super.spellbook(),
    ];
  }
}

export default Abilities;
