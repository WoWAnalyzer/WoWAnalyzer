import {
  WINTERS_PROTECTION_REDUCTION_SEC,
  FLOW_OF_TIME_REDUCTION_SEC,
} from 'analysis/retail/mage/shared';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import COVENANTS from 'game/shadowlands/COVENANTS';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

class Abilities extends CoreAbilities {
  spellbook() {
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
        spell: SPELLS.FIRE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
        cooldown: (haste: any) => 12 / (1 + haste),
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ICE_LANCE.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 2,
        damageSpellIds: [SPELLS.ICE_LANCE_DAMAGE.id],
      },
      {
        spell: SPELLS.FLURRY.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        timelineSortIndex: 3,
        damageSpellIds: [SPELLS.FLURRY_DAMAGE.id],
      },
      {
        spell: TALENTS.GLACIAL_SPIKE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        enabled: combatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT.id),
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
        enabled: combatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT.id),
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
        enabled: combatant.hasTalent(TALENTS.COMET_STORM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 5,
        damageSpellIds: [SPELLS.COMET_STORM_DAMAGE.id],
      },
      {
        spell: TALENTS.EBONBOLT_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.EBONBOLT_TALENT.id),
        castEfficiency: {
          //If using Glacial Spike, it is recommended to hold Ebonbolt as an emergency proc if GS is available and you dont have a Brain Freeze Proc. Therefore, with good luck, it is possible to go the entire fight without casting Ebonbolt.
          suggestion: !combatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT.id),
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 6,
        damageSpellIds: [SPELLS.EBONBOLT_DAMAGE.id],
      },
      {
        spell: SPELLS.BLIZZARD.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: (haste: any) => 8 / (1 + haste),
        timelineSortIndex: 7,
        damageSpellIds: [SPELLS.BLIZZARD_DAMAGE.id],
      },
      {
        spell: SPELLS.CONE_OF_COLD.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 12,
        timelineSortIndex: 8,
        //damageSpellIds: [SPELLS.CONE_OF_COLD.id], // needs verification
      },
      {
        spell: TALENTS.ICE_NOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
        enabled: combatant.hasTalent(TALENTS.ICE_NOVA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 9,
        //damageSpellIds: [SPELLS.ICE_NOVA_TALENT.id], // needs verification
      },

      // Cooldowns; start at sortindex 15
      {
        spell: SPELLS.FROZEN_ORB.id,
        category: SPELL_CATEGORY.ROTATIONAL,
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
        spell: TALENTS.RUNE_OF_POWER_TALENT.id,
        buffSpellId: SPELLS.RUNE_OF_POWER_BUFF.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        enabled: combatant.hasTalent(TALENTS.RUNE_OF_POWER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 16, // Shares talent row with Mirror Image
      },
      {
        spell: SPELLS.ICY_VEINS.id,
        buffSpellId: SPELLS.ICY_VEINS.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        timelineSortIndex: 17,
      },
      {
        spell: SPELLS.TIME_WARP.id,
        buffSpellId: SPELLS.TIME_WARP.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 300,
        timelineSortIndex: 18,
      },
      {
        spell: SPELLS.RADIANT_SPARK.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        enabled: combatant.hasCovenant(COVENANTS.KYRIAN.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.DEATHBORNE.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        enabled: combatant.hasCovenant(COVENANTS.NECROLORD.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.MIRRORS_OF_TORMENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        enabled: combatant.hasCovenant(COVENANTS.VENTHYR.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.SHIFTING_POWER.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        enabled: combatant.hasCovenant(COVENANTS.NIGHT_FAE.id),
      },

      //Defensives
      {
        spell: SPELLS.ICE_BARRIER.id,
        buffSpellId: SPELLS.ICE_BARRIER.id,
        cooldown: 25,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ICE_BLOCK.id,
        buffSpellId: SPELLS.ICE_BLOCK.id,
        cooldown: combatant.hasConduitBySpellID(SPELLS.WINTERS_PROTECTION.id)
          ? 240 -
            WINTERS_PROTECTION_REDUCTION_SEC[
              combatant.conduitRankBySpellID(SPELLS.WINTERS_PROTECTION.id)
            ]
          : 240,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIRROR_IMAGE.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
      },

      //Utility
      {
        spell: SPELLS.ARCANE_INTELLECT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FROST_NOVA.id,
        category: SPELL_CATEGORY.UTILITY,
        cooldown: 30,
        charges: combatant.hasTalent(TALENTS.ICE_WARD_TALENT.id) ? 2 : 1,
      },
      {
        spell: SPELLS.BLINK.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(TALENTS.SHIMMER_TALENT.id),
        cooldown: combatant.hasConduitBySpellID(SPELLS.FLOW_OF_TIME.id)
          ? 15 - FLOW_OF_TIME_REDUCTION_SEC[combatant.conduitRankBySpellID(SPELLS.FLOW_OF_TIME.id)]
          : 15,
      },
      {
        spell: TALENTS.SHIMMER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: combatant.hasConduitBySpellID(SPELLS.FLOW_OF_TIME.id)
          ? 25 - FLOW_OF_TIME_REDUCTION_SEC[combatant.conduitRankBySpellID(SPELLS.FLOW_OF_TIME.id)]
          : 25,
        charges: 2,
        enabled: combatant.hasTalent(TALENTS.SHIMMER_TALENT.id),
      },
      {
        spell: SPELLS.COUNTERSPELL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 24,
      },
      {
        spell: SPELLS.REMOVE_CURSE.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 8,
      },
      {
        spell: SPELLS.SLOW_FALL.id,
        buffSpellId: SPELLS.SLOW_FALL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPELLSTEAL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ALTER_TIME.id,
        buffSpellId: SPELLS.ALTER_TIME_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.INVISIBILITY.id,
        buffSpellId: SPELLS.INVISIBILITY_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 300,
      },
      {
        spell: SPELLS.COLD_SNAP.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: 300,
      },
      {
        spell: SPELLS.SUMMON_WATER_ELEMENTAL.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(TALENTS.LONELY_WINTER_TALENT.id),
        cooldown: 30,
      },
      {
        spell: [
          SPELLS.POLYMORPH_SHEEP.id,
          SPELLS.POLYMORPH_PIG.id,
          SPELLS.POLYMORPH_BLACK_CAT.id,
          SPELLS.POLYMORPH_MONKEY.id,
          SPELLS.POLYMORPH_RABBIT.id,
          SPELLS.POLYMORPH_POLAR_BEAR_CUB.id,
          SPELLS.POLYMORPH_PORCUPINE.id,
          SPELLS.POLYMORPH_TURTLE.id,
          SPELLS.POLYMORPH_TURKEY.id,
          SPELLS.POLYMORPH_PENGUIN.id,
          SPELLS.POLYMORPH_BUMBLEBEE.id,
          SPELLS.POLYMORPH_PEACOCK.id,
          SPELLS.POLYMORPH_DIREHORN.id,
          SPELLS.POLYMORPH_MAWRAT.id,
        ],
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
