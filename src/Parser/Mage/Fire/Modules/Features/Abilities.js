import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational spells
      {
        spell: SPELLS.FIREBALL,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PYROBLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.SCORCH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PHOENIX_FLAMES_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: 30,
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.FIRE_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: false,
        cooldown: haste => combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id) ? 10 / (1 + haste) : 12 / (1 + haste),
        charges: combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id) ? 3 : 2,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.METEOR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        isOnGCD: true,
        cooldown: 45,
        enabled: combatant.hasTalent(SPELLS.METEOR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.DRAGONS_BREATH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
        cooldown: 20,
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.FLAMESTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LIVING_BOMB_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
        cooldown: haste => 12 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.LIVING_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.BLAST_WAVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        isOnGCD: true,
        cooldown: 25,
        enabled: combatant.hasTalent(SPELLS.BLAST_WAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      // Cooldowns
      {
        spell: SPELLS.COMBUSTION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        isOnGCD: false,
        cooldown: 120,
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
        spell: SPELLS.BLAZING_BARRIER,
        buffSpellId: SPELLS.BLAZING_BARRIER.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isOnGCD: true,
        cooldown: 25,
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.ICE_BLOCK,
        buffSpellId: SPELLS.ICE_BLOCK.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        isOnGCD: true,
        cooldown: 240,
        castEfficiency: {
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
        cooldown: 30,
        charges: combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id) ? 2 : 1,
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.BLINK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 15,
        enabled: !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.SHIMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
        cooldown: 15,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.COUNTERSPELL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: false,
        cooldown: 24,
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.REMOVE_CURSE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        isOnGCD: true,
        cooldown: 8,
        castEfficiency: {
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
          disabled: true,
        },
      },
    ];
  }
}

export default Abilities;
