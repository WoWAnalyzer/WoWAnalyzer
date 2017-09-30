import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    // Rotational Spells
    {
      spell: SPELLS.RENEWING_MIST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => 8,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.RENEWING_MIST_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
      extraSuggestion: 'You need to use this ability as close to on cooldown as possible. Get in the habbit of using this ability as it is our only \'cast on cooldown\' ability.',
    },
    // Cooldowns
    {
      spell: SPELLS.THUNDER_FOCUS_TEA,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
    },
    {
      spell: SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT.id),
    },
    {
      spell: SPELLS.MANA_TEA_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.MANA_TEA_TALENT.id),
    },
    {
      spell: SPELLS.CHI_BURST_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.CHI_BURST_TALENT.id),
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.CHI_BURST_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.ZEN_PULSE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.ZEN_PULSE_TALENT.id),
    },
    {
      spell: SPELLS.CHI_WAVE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 15,
      isActive: combatant => combatant.hasTalent(SPELLS.CHI_WAVE_TALENT.id),
    },
    {
      spell: SPELLS.LIFE_COCOON,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.REVIVAL,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => 180 - (combatant.traitsBySpellId[SPELLS.TENDRILS_OF_REVIVAL.id] || 0) * 10,
      noSuggestion: true,
      noCanBeImproved: true,
    },


    // Other Spell Casting Metrics
    {
      spell: SPELLS.EFFUSE,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },

    {
      spell: SPELLS.ENVELOPING_MISTS,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
    },
    {
      spell: SPELLS.VIVIFY,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.VIVIFY.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.SHEILUNS_GIFT,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.SHEILUNS_GIFT.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.ESSENCE_FONT,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.ESSENCE_FONT_BUFF.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.SOOTHING_MIST,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.SOOTHING_MIST.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },
    {
      spell: SPELLS.REFRESHING_JADE_WIND_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.OTHERS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.REFRESHING_JADE_WIND_TALENT.id),
      getOverhealing: (_, getAbility) => {
        const { healingEffective, healingAbsorbed, healingOverheal } = getAbility(SPELLS.REFRESHING_JADE_WIND_HEAL.id);
        return healingOverheal / (healingEffective + healingAbsorbed + healingOverheal);
      },
    },

    // Utility Spells
    {
      spell: SPELLS.ARCANE_TORRENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      hideWithZeroCasts: true,
    },
    {
      spell: SPELLS.DIFFUSE_MAGIC_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      isActive: combatant => combatant.hasTalent(SPELLS.DIFFUSE_MAGIC_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DAMPEN_HARM_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.DAMPEN_HARM_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.FORTIFYING_BREW,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.HEALING_ELIXIR_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      charges: 2,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.HEALING_ELIXIR_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },

  ];
}

export default CastEfficiency;
