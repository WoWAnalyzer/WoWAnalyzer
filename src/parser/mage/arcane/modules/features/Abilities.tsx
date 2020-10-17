import SPELLS from 'common/SPELLS';

import CoreAbilities from 'parser/core/modules/Abilities';

const WINTERS_PROTECTION_REDUCTION_MS: {[rank: number]: number } = {
  1: 30,
  2: 34,
  3: 38,
  4: 43,
  5: 47,
  6: 51,
  7: 55,
  8: 60,
  9: 64,
  10: 68,
  11: 72,
  12: 77,
  13: 81,
  14: 85,
  15: 90,
};

const FLOW_OF_TIME_REDUCTION_SEC: {[rank: number]: number } = {
  1: 1,
  2: 1.25,
  3: 1.5,
  4: 1.75,
  5: 2,
  6: 2.25,
  7: 2.5,
  8: 2.75,
  9: 3,
  10: 3.25,
  11: 3.5,
  12: 3.75,
  13: 4,
  14: 4.250,
  15: 5,
};

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.ARCANE_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.ARCANE_BLAST.id],
      },
      {
        spell: SPELLS.FROSTBOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        damageSpellIds: [SPELLS.FROSTBOLT_DAMAGE.id],
      },
      {
        spell: SPELLS.FIRE_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: null,
        cooldown: (haste: any) => 12 / (1 + haste),
      },
      {
        spell: SPELLS.ARCANE_MISSILES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_BARRAGE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SUPERNOVA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
        enabled: combatant.hasTalent(SPELLS.SUPERNOVA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.NETHER_TEMPEST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        enabled: combatant.hasTalent(SPELLS.NETHER_TEMPEST_TALENT.id),
      },
      {
        spell: SPELLS.ARCANE_ORB_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.ARCANE_ORB_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
        damageSpellIds: [SPELLS.ARCANE_ORB_DAMAGE.id],
      },

      // Cooldowns
      {
        spell: SPELLS.TIME_WARP,
        buffSpellId: SPELLS.TIME_WARP.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: null,
        cooldown: 300,
      },
      {
        spell: SPELLS.ARCANE_FAMILIAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 10,
        enabled: combatant.hasTalent(SPELLS.ARCANE_FAMILIAR_TALENT.id),
      },
      {
        spell: SPELLS.ARCANE_POWER,
        buffSpellId: SPELLS.ARCANE_POWER.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.EVOCATION,
        buffSpellId: SPELLS.EVOCATION.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.PRESENCE_OF_MIND,
        buffSpellId: SPELLS.PRESENCE_OF_MIND.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: null,
        cooldown: 60,
        castEfficiency: {
          suggestion: false,
          recommendedEfficiency: 0.60,
        },
      },
      {
        spell: SPELLS.RUNE_OF_POWER_TALENT,
        buffSpellId: SPELLS.RUNE_OF_POWER_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      //Defensives
      {
        spell: SPELLS.PRISMATIC_BARRIER,
        buffSpellId: SPELLS.PRISMATIC_BARRIER.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
      },
      {
        spell: SPELLS.ICE_BLOCK,
        buffSpellId: SPELLS.ICE_BLOCK.id,
        cooldown: combatant.hasConduitBySpellID(SPELLS.WINTERS_PROTECTION.id) ? 240 - WINTERS_PROTECTION_REDUCTION_MS[combatant.conduitRankBySpellID(SPELLS.WINTERS_PROTECTION.id)] : 240,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.MIRROR_IMAGE,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
      },

      //Utility
      {
        spell: SPELLS.ARCANE_INTELLECT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FROST_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        charges: combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id) ? 2 : 1,
      },
      {
        spell: SPELLS.SLOW,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.BLINK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        cooldown: combatant.hasConduitBySpellID(SPELLS.FLOW_OF_TIME.id) ? 15 - FLOW_OF_TIME_REDUCTION_SEC[combatant.conduitRankBySpellID(SPELLS.FLOW_OF_TIME.id)] : 15,
      },
      {
        spell: SPELLS.SHIMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: null,
        cooldown: combatant.hasConduitBySpellID(SPELLS.FLOW_OF_TIME.id) ? 25 - FLOW_OF_TIME_REDUCTION_SEC[combatant.conduitRankBySpellID(SPELLS.FLOW_OF_TIME)] : 25,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
      },
      {
        spell: SPELLS.COUNTERSPELL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: null,
        cooldown: 24,
      },
      {
        spell: SPELLS.REMOVE_CURSE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 8,
      },
      {
        spell: SPELLS.SLOW_FALL,
        buffSpellId: SPELLS.SLOW_FALL.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.SPELL_STEAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FOCUS_MAGIC_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ALTER_TIME,
        buffSpellId: SPELLS.ALTER_TIME_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.GREATER_INVISIBILITY,
        buffSpellId: SPELLS.GREATER_INVISIBILITY_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
      },
      {
        spell: [SPELLS.POLYMORPH_SHEEP, SPELLS.POLYMORPH_PIG,
          SPELLS.POLYMORPH_BLACK_CAT, SPELLS.POLYMORPH_MONKEY,
          SPELLS.POLYMORPH_RABBIT, SPELLS.POLYMORPH_POLAR_BEAR_CUB,
          SPELLS.POLYMORPH_PORCUPINE, SPELLS.POLYMORPH_TURTLE,
          SPELLS.POLYMORPH_TURKEY, SPELLS.POLYMORPH_PENGUIN,
          SPELLS.POLYMORPH_BUMBLEBEE, SPELLS.POLYMORPH_PEACOCK,
          SPELLS.POLYMORPH_DIREHORN, SPELLS.POLYMORPH_MAWRAT],
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
    ];
  }
}

export default Abilities;
