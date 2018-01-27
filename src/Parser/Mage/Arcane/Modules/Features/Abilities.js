import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational spells
      {
        spell: SPELLS.ARCANE_BLAST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.ARCANE_MISSILES,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.ARCANE_BARRAGE,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.ARCANE_EXPLOSION,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      },
      {
        spell: SPELLS.MARK_OF_ALUNETH,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 60,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.ARCANE_FAMILIAR_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 10,
        enabled: combatant.hasTalent(SPELLS.ARCANE_FAMILIAR_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.SUPERNOVA_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 25,
        enabled: combatant.hasTalent(SPELLS.SUPERNOVA_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.CHARGED_UP_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 40,
        enabled: combatant.hasTalent(SPELLS.CHARGED_UP_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.NETHER_TEMPEST_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        enabled: combatant.hasTalent(SPELLS.NETHER_TEMPEST_TALENT.id),
      },
      {
        spell: SPELLS.ARCANE_ORB_TALENT,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL_AOE,
        cooldown: 20,
        enabled: combatant.hasTalent(SPELLS.ARCANE_ORB_TALENT.id),
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },

      // Cooldowns
      {
        spell: SPELLS.ARCANE_POWER,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.EVOCATION,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        castEfficiency: {
          suggestion: true,
          recommendedEfficiency: 0.90,
        },
      },
      {
        spell: SPELLS.PRESENCE_OF_MIND,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 60,
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
        spell: SPELLS.PRISMATIC_BARRIER,
        category: Abilities.SPELL_CATEGORIES.DEFENSIVE,
        cooldown: 25,
      },
      {
        spell: SPELLS.ICE_BLOCK,
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
        spell: SPELLS.DISPLACEMENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 22,
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
        spell: SPELLS.GREATER_INVISIBILITY,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
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
