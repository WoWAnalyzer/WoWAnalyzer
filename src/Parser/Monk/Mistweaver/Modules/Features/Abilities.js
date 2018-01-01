import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    // Rotational Spells
    {
      spell: SPELLS.RENEWING_MIST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 8,
      extraSuggestion: 'You need to use this ability as close to on cooldown as possible. Get in the habbit of using this ability as it is our only \'cast on cooldown\' ability.',
    },
    // Cooldowns
    {
      spell: SPELLS.THUNDER_FOCUS_TEA,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
    },
    {
      spell: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id),
    },
    {
      spell: SPELLS.MANA_TEA_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
    },
    {
      spell: SPELLS.CHI_BURST_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
    },
    {
      spell: SPELLS.ZEN_PULSE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.ZEN_PULSE_TALENT.id),
    },
    {
      spell: SPELLS.CHI_WAVE_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
    },
    {
      spell: SPELLS.LIFE_COCOON,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.REVIVAL,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => 180 - (combatant.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0) * 10,
      noSuggestion: true,
      noCanBeImproved: true,
    },


    // Other Spell Casting Metrics
    {
      spell: SPELLS.EFFUSE,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },

    {
      spell: SPELLS.ENVELOPING_MISTS,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.VIVIFY,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.SHEILUNS_GIFT,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.ESSENCE_FONT,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => 12,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SOOTHING_MIST,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.REFRESHING_JADE_WIND_TALENT,
      category: Abilities.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
    },

    // Utility Spells
    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      isUndetectable: true,
    },
    {
      spell: SPELLS.DIFFUSE_MAGIC_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DAMPEN_HARM_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FORTIFYING_BREW,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.HEALING_ELIXIR_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      charges: 2,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.CRACKLING_JADE_LIGHTNING,
      category: Abilities.SPELL_CATEGORIES.HEALER_DAMAGING_SPELL,
      getCooldown: haste => null,
      isOnGCD: true,
      noSuggestion: true,
      noCanBeImproved: true,
    },
  ];
}

export default Abilities;
