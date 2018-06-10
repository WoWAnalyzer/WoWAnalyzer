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
      },
      {
        spell: SPELLS.PYROBLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.SCORCH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.PHOENIXS_FLAMES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 45,
        charges: 3,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.FIRE_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 12 / (1 + haste),
        charges: 2,
        enabled: !combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) && !combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.FIRE_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 10 / (1 + haste),
        charges: 3,
        enabled: combatant.hasTalent(SPELLS.FLAME_ON_TALENT.id) || combatant.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.METEOR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
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
        cooldown: 20,
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.FLAMESTRIKE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
      },
      {
        spell: SPELLS.LIVING_BOMB_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: haste => 12 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.LIVING_BOMB_TALENT.id),
      },
      {
        spell: SPELLS.CINDERSTORM_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: haste => 9 / (1 + haste),
        enabled: combatant.hasTalent(SPELLS.CINDERSTORM_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.70,
        },
      },
      {
        spell: SPELLS.BLAST_WAVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
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
        cooldown: 120,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.MIRROR_IMAGE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
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
        cooldown: 25,
      },
      {
        spell: SPELLS.ICE_BLOCK,
        buffSpellId: SPELLS.ICE_BLOCK.id,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 240,
        castEfficiency: {
          disabled: true,
        },
      },

      //Utility
      {
        spell: SPELLS.FROST_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        enabled: !combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.FROST_NOVA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        charges: 2,
        enabled: combatant.hasTalent(SPELLS.ICE_WARD_TALENT.id),
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.BLINK,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        enabled: !combatant.hasTalent(SPELLS.SHIMMER_TALENT.id),
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.SHIMMER_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
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
        cooldown: 24,
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.SLOW_FALL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.SPELL_STEAL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
      },
      {
        spell: SPELLS.INVISIBILITY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 300,
        castEfficiency: {
          disabled: true,
        },
      },
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
        },
      },
    ];
  }
}

export default Abilities;
