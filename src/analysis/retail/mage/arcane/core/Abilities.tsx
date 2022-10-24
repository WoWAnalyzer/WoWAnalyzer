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
        spell: SPELLS.ARCANE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.ARCANE_BLAST.id],
      },
      {
        spell: SPELLS.FROSTBOLT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.FROSTBOLT_DAMAGE.id],
      },
      {
        spell: SPELLS.FIRE_BLAST.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: null,
        cooldown: (haste: any) => 12 / (1 + haste),
      },
      {
        spell: TALENTS.ARCANE_MISSILES_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.ARCANE_BARRAGE_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.TOUCH_OF_THE_MAGI_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: TALENTS.SUPERNOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
        enabled: combatant.hasTalent(TALENTS.SUPERNOVA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.NETHER_TEMPEST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(TALENTS.NETHER_TEMPEST_TALENT.id),
      },
      {
        spell: TALENTS.ARCANE_ORB_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 20,
        enabled: combatant.hasTalent(TALENTS.ARCANE_ORB_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
        damageSpellIds: [SPELLS.ARCANE_ORB_DAMAGE.id],
      },

      // Cooldowns
      {
        spell: SPELLS.TIME_WARP.id,
        buffSpellId: SPELLS.TIME_WARP.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 300,
      },
      {
        spell: TALENTS.ARCANE_FAMILIAR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 10,
        enabled: combatant.hasTalent(TALENTS.ARCANE_FAMILIAR_TALENT.id),
      },
      {
        spell: TALENTS.ARCANE_SURGE_TALENT.id,
        buffSpellId: TALENTS.ARCANE_SURGE_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.EVOCATION_TALENT.id,
        buffSpellId: TALENTS.EVOCATION_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        buffSpellId: TALENTS.PRESENCE_OF_MIND_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 60,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.6,
        },
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
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },

      //Defensives
      {
        spell: SPELLS.PRISMATIC_BARRIER.id,
        buffSpellId: SPELLS.PRISMATIC_BARRIER.id,
        category: SPELL_CATEGORY.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: TALENTS.ICE_BLOCK_TALENT.id,
        buffSpellId: TALENTS.ICE_BLOCK_TALENT.id,
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
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        charges: combatant.hasTalent(TALENTS.ICE_WARD_TALENT.id) ? 2 : 1,
      },
      {
        spell: SPELLS.SLOW.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
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
        spell: TALENTS.SPELLSTEAL_TALENT.id,
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
        spell: SPELLS.GREATER_INVISIBILITY.id,
        buffSpellId: SPELLS.GREATER_INVISIBILITY_BUFF.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
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
