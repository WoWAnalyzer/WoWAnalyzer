import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

class Abilities extends CoreAbilities {
  spellbook() {
    const combatant = this.combatants.selected;
    return [
      // Rotational Spells
      {
        spell: SPELLS.RENEWING_MIST,
        category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
        cooldown: 8,
        isOnGCD: true,
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'You need to use this ability as close to on cooldown as possible. Get in the habbit of using this ability as it is our only \'cast on cooldown\' ability.',
        },
        timelineSortIndex: 1,
      },
      // Cooldowns
      {
        spell: SPELLS.THUNDER_FOCUS_TEA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 17,
      },
      {
        spell: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: true,
        timelineSortIndex: 3,
      },
      {
        spell: SPELLS.MANA_TEA_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        timelineSortIndex: 15,
      },
      {
        spell: SPELLS.CHI_BURST_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: true,
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.ZEN_PULSE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.ZEN_PULSE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: true,
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.CHI_WAVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
        isOnGCD: true,
        timelineSortIndex: 10,
      },
      {
        spell: SPELLS.LIFE_COCOON,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        timelineSortIndex: 17,
      },
      {
        spell: SPELLS.REVIVAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => 180 - (combatant.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0) * 10,
        isOnGCD: true,
        timelineSortIndex: 18,
      },

      // Other Spell Casting Metrics
      {
        spell: SPELLS.EFFUSE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        timelineSortIndex: 20,
      },

      {
        spell: SPELLS.ENVELOPING_MISTS,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        timelineSortIndex: 19,
      },
      {
        spell: SPELLS.VIVIFY,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        timelineSortIndex: 4,
      },
      {
        spell: SPELLS.SHEILUNS_GIFT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        timelineSortIndex: 5,
      },
      {
        spell: SPELLS.ESSENCE_FONT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        isOnGCD: true,
        cooldown: 12,
        timelineSortIndex: 2,
      },
      {
        spell: SPELLS.SOOTHING_MIST,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.REFRESHING_JADE_WIND_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
        isOnGCD: true,
        timelineSortIndex: 3,
      },

      // Utility Spells
      {
        spell: SPELLS.ARCANE_TORRENT_MANA,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        isUndetectable: true,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.DIFFUSE_MAGIC_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
      },
      {
        spell: SPELLS.DAMPEN_HARM_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 120,
        enabled: combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
      },
      {
        spell: SPELLS.FORTIFYING_BREW,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 90,
      },
      {
        spell: SPELLS.HEALING_ELIXIR_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
      },
      {
        spell: SPELLS.DETOX,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 8,
        isOnGCD: true,
      },
      {
        spell: SPELLS.PARALYSIS,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 15,
        isOnGCD: true,
      },
      {
        spell: SPELLS.LEG_SWEEP_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 45,
        isOnGCD: true,
      },

      {
        spell: SPELLS.ROLL,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 3 : 2,
        cooldown: combatant.hasTalent(SPELLS.CELERITY_TALENT.id) ? 15 : 20,
        isOnGCD: true,
        enabled: !combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.CHI_TORPEDO_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        charges: 2,
        cooldown: 20,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.CHI_TORPEDO_TALENT.id),
      },
      {
        spell: SPELLS.TIGERS_LUST_TALENT,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 30,
        isOnGCD: true,
        enabled: combatant.hasTalent(SPELLS.TIGERS_LUST_TALENT.id),
      },
      {
        spell: SPELLS.TRANSCENDENCE,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 10,
        isOnGCD: true,
      },
      {
        spell: SPELLS.TRANSCENDENCE_TRANSFER,
        category: Abilities.SPELL_CATEGORIES.UTILITY,
        cooldown: 25,
        isOnGCD: true,
      },

      // Damage Spells
      {
        spell: SPELLS.TIGER_PALM,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
        timelineSortIndex: 31,
      },
      {
        spell: SPELLS.BLACKOUT_KICK,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
        timelineSortIndex: 32,
      },
      {
        spell: SPELLS.RISING_SUN_KICK,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.SPINNING_CRANE_KICK,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
        timelineSortIndex: 100,
      },
      {
        spell: SPELLS.CRACKLING_JADE_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
        timelineSortIndex: 100,
      },

    ];
  }
}

export default Abilities;
