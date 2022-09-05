import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import CoreAbilities from 'parser/core/modules/Abilities';
import SPELL_CATEGORY from 'parser/core/SPELL_CATEGORY';

import { WINTERS_PROTECTION_REDUCTION_SEC, FLOW_OF_TIME_REDUCTION_SEC } from '@wowanalyzer/mage';

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
        spell: SPELLS.ARCANE_MISSILES.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_BARRAGE.id,
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
        spell: SPELLS.TOUCH_OF_THE_MAGI.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        cooldown: 45,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SUPERNOVA_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
        enabled: combatant.hasTalent(SPELLS.SUPERNOVA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.NETHER_TEMPEST_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.NETHER_TEMPEST_TALENT.id),
      },
      {
        spell: SPELLS.ARCANE_ORB_TALENT.id,
        category: SPELL_CATEGORY.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.ARCANE_ORB_TALENT.id),
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
        spell: SPELLS.ARCANE_FAMILIAR_TALENT.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 10,
        enabled: combatant.hasTalent(SPELLS.ARCANE_FAMILIAR_TALENT.id),
      },
      {
        spell: SPELLS.ARCANE_POWER.id,
        buffSpellId: SPELLS.ARCANE_POWER.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.9,
        },
      },
      {
        spell: SPELLS.EVOCATION.id,
        buffSpellId: SPELLS.EVOCATION.id,
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
        spell: SPELLS.PRESENCE_OF_MIND.id,
        buffSpellId: SPELLS.PRESENCE_OF_MIND.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: null,
        cooldown: 60,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.6,
        },
      },
      {
        spell: SPELLS.RUNE_OF_POWER_TALENT.id,
        buffSpellId: SPELLS.RUNE_OF_POWER_BUFF.id,
        category: SPELL_CATEGORY.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
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
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        charges: combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id) ? 2 : 1,
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
        enabled: !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        cooldown: combatant.hasConduitBySpellID(SPELLS.FLOW_OF_TIME.id)
          ? 15 - FLOW_OF_TIME_REDUCTION_SEC[combatant.conduitRankBySpellID(SPELLS.FLOW_OF_TIME.id)]
          : 15,
      },
      {
        spell: SPELLS.SHIMMER_TALENT.id,
        category: SPELL_CATEGORY.UTILITY,
        gcd: null,
        cooldown: combatant.hasConduitBySpellID(SPELLS.FLOW_OF_TIME.id)
          ? 25 - FLOW_OF_TIME_REDUCTION_SEC[combatant.conduitRankBySpellID(SPELLS.FLOW_OF_TIME.id)]
          : 25,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
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
        spell: SPELLS.FOCUS_MAGIC_TALENT.id,
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
