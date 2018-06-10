import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational spells
      {
        spell: SPELLS.FROSTBOLT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.EBONBOLT_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.EBONBOLT_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.FLURRY,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.ICE_LANCE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.CONE_OF_COLD,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: 12,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.GLACIAL_SPIKE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.GLACIAL_SPIKE_TALENT.id),
        isOnGCD: true,
      },
      {
        spell: SPELLS.COMET_STORM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
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
        isOnGCD: true,
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
        isOnGCD: true,
        cooldown: haste => 8 / (1 + haste),
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.RAY_OF_FROST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: 80,
        enabled: combatant.hasTalent(SPELLS.RAY_OF_FROST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },

      // Cooldowns

      {
        spell: SPELLS.FROZEN_ORB,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ICY_VEINS,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
        cooldown: 180,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.MIRROR_IMAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.MIRROR_IMAGE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.RUNE_OF_POWER_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: true,
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
        isOnGCD: true,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.ICE_BLOCK,
        buffSpellId: SPELLS.ICE_BLOCK.id,
        cooldown: 240,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isOnGCD: true,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },

      //Utility
      {
        spell: SPELLS.ARCANE_INTELLECT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.FROST_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
        cooldown: 30,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.FROST_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
        cooldown: 30,
        charges: 2,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.BLINK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        cooldown: 15,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.SHIMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
        cooldown: 20,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.COUNTERSPELL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
        cooldown: 24,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.REMOVE_CURSE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 8,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.SLOW_FALL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SPELL_STEAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
      },
      {
        spell: SPELLS.INVISIBILITY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 300,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.COLD_SNAP,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
        cooldown: 300,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
      {
        spell: SPELLS.SUMMON_WATER_ELEMENTAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.LONELY_WINTER_TALENT.id),
        cooldown: 30,
        castEfficiency: {
          suggestion: false,
          disabled: true,
        },
      },
    ];
  }
}

export default Abilities;
