import SPELLS from 'common/SPELLS';

import CoreAbilities from 'parser/shared/modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.selectedCombatant;
    return [
      // Rotational spells
      {
        spell: SPELLS.FROSTBOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.EBONBOLT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.EBONBOLT_TALENT.id),
        castEfficiency: {
          //If using Glacial Spike, it is recommended to hold Ebonbolt as an emergency proc if GS is available and you dont have a Brain Freeze Proc. Therefore, with good luck, it is possible to go the entire fight without casting Ebonbolt.
          suggestion: !combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id),
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.FLURRY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ICE_LANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.CONE_OF_COLD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 12,
      },
      {
        spell: SPELLS.GLACIAL_SPIKE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id),
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.COMET_STORM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.COMET_STORM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ICE_NOVA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 25,
        enabled: combatant.hasTalent(SPELLS.ICE_NOVA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.BLIZZARD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        gcd: {
          base: 1500,
        },
        cooldown: haste => 8 / (1 + haste),
      },
      {
        spell: SPELLS.RAY_OF_FROST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 80,
        enabled: combatant.hasTalent(SPELLS.RAY_OF_FROST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
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
        spell: SPELLS.FROZEN_ORB,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        gcd: {
          base: 1500,
        },
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ICY_VEINS,
        buffSpellId: SPELLS.ICY_VEINS.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.MIRROR_IMAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.RUNE_OF_POWER_TALENT,
        buffSpellId: SPELLS.RUNE_OF_POWER_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        gcd: {
          base: 1500,
        },
        cooldown: 40,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.RUNE_OF_POWER_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      //Defensives
      {
        spell: SPELLS.ICE_BARRIER,
        buffSpellId: SPELLS.ICE_BARRIER.id,
        cooldown: 25,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.ICE_BLOCK,
        buffSpellId: SPELLS.ICE_BLOCK.id,
        cooldown: 240,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        gcd: {
          base: 1500,
        },
      },

      //Utility
      {
        spell: SPELLS.ARCANE_INTELLECT,
        buffSpellId: SPELLS.ARCANE_INTELLECT.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
      },
      {
        spell: SPELLS.FROST_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        charges: combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id) ? 2 : 1,
      },
      {
        spell: SPELLS.BLINK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        cooldown: 15,
      },
      {
        spell: SPELLS.SHIMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: null,
        cooldown: 20,
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
        spell: SPELLS.INVISIBILITY,
        buffSpellId: SPELLS.INVISIBILITY_BUFF.id,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        cooldown: 300,
      },
      {
        spell: SPELLS.COLD_SNAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: null,
        cooldown: 300,
      },
      {
        spell: SPELLS.SUMMON_WATER_ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        gcd: {
          base: 1500,
        },
        enabled: !combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id),
        cooldown: 30,
      },
    ];
  }
}

export default Abilities;
