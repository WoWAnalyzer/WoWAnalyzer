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
        castEfficiency: {
          suggestion: true,
          extraSuggestion: 'You need to use this ability as close to on cooldown as possible. Get in the habbit of using this ability as it is our only \'cast on cooldown\' ability.',
        },
      },
      // Cooldowns
      {
        spell: SPELLS.THUNDER_FOCUS_TEA,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
        enabled: combatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.MANA_TEA_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 90,
        enabled: combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CHI_BURST_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 30,
        enabled: combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.ZEN_PULSE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.ZEN_PULSE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.CHI_WAVE_TALENT,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 15,
        enabled: combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
        castEfficiency: {
          suggestion: true,
        },
      },
      {
        spell: SPELLS.LIFE_COCOON,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: 180,
      },
      {
        spell: SPELLS.REVIVAL,
        category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
        cooldown: (haste, combatant) => 180 - (combatant.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0) * 10,
      },

      // Other Spell Casting Metrics
      {
        spell: SPELLS.EFFUSE,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },

      {
        spell: SPELLS.ENVELOPING_MISTS,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.VIVIFY,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.ESSENCE_FONT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        cooldown: 12,
      },
      {
        spell: SPELLS.SOOTHING_MIST,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
      },
      {
        spell: SPELLS.REFRESHING_JADE_WIND_TALENT,
        category: Abilities.SPELL_CATEGORIES.OTHERS,
        enabled: combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
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
        spell: SPELLS.CRACKLING_JADE_LIGHTNING,
        category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
        isOnGCD: true,
      },
    ];
  }
}

export default Abilities;
