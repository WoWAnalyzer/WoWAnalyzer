import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreAbilities from 'Parser/Core/Modules/Abilities';
import calculateMaxCasts from 'Parser/Core/calculateMaxCasts';

/* eslint-disable no-unused-vars */

class Abilities extends CoreAbilities {
  static ABILITIES = [
    ...CoreAbilities.ABILITIES,

    {
      spell: SPELLS.VOID_BOLT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      recommendedCastEfficiency: 0.85,
      getCooldown: (haste, combatant) => 4.5 / (1 + haste),
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const { averageVoidformHaste } = parser.modules.voidform;
        const cooldownVoidBolt = 4.5 / averageVoidformHaste;

        return calculateMaxCasts(cooldownVoidBolt, parser.modules.combatants.selected.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));
      },
    },

    {
      spell: SPELLS.MIND_BLAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => !combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id),
      recommendedCastEfficiency: 0.55,
      getCooldown: (haste, combatant) => ((combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 6 : 9) / ( 1 + haste )),
    },

    {
      spell: SPELLS.MIND_BLAST,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id),
      recommendedCastEfficiency: 0.85,
      getCooldown: (haste, combatant) => ((combatant.hasBuff(SPELLS.VOIDFORM_BUFF.id) ? 6 : 9) / ( 1 + haste )),
      charges: 2,
    },

    {
      spell: SPELLS.MIND_FLAY,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHADOW_WORD_DEATH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      noCanBeImproved: true,
      noSuggestion: true,
      getCooldown: haste => 9,
      charges: 2,
    },

    {
      spell: SPELLS.SHADOW_WORD_VOID_TALENT,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.SHADOW_WORD_VOID_TALENT.id),
    },

    {
      spell: SPELLS.SHADOW_WORD_PAIN,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.VAMPIRIC_TOUCH,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.VOID_ERUPTION,
      category: Abilities.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    // Cooldowns
    {
      spell: SPELLS.VOID_TORRENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.9,
      getCooldown: haste => 60,
    },

    {
      spell: SPELLS.MINDBENDER_TALENT_SHADOW,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
    },

    {
      spell: SPELLS.SHADOWFIEND,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 180,
      isActive: combatant => !combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
    },

    {
      spell: SPELLS.POWER_INFUSION_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.POWER_INFUSION_TALENT.id),
    },

    {
      spell: SPELLS.SHADOW_CRASH_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id),
    },

    {
      spell: SPELLS.SURRENDER_TO_MADNESS_TALENT,
      category: Abilities.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 600,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id),
    },

    // Utility
    {
      spell: SPELLS.DISPERSION,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => 90 - (10 * selectedCombatant.traitsBySpellId[SPELLS.FROM_THE_SHADOWS_TRAIT.id]),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SILENCE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.MIND_BOMB_TALENT,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.VAMPIRIC_EMBRACE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.POWER_WORD_SHIELD,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 7.5 / (1 + haste),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHADOW_MEND,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.FADE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.ARCANE_TORRENT_MANA,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      isUndetectable: true,
    },

    {
      spell: SPELLS.MASS_DISPEL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DISPEL_MAGIC,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MIND_CONTROL,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => (selectedCombatant.hasTalent(SPELLS.DOMINANT_MIND_TALENT.id) ? 120 : 0),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHACKLE_UNDEAD,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.PSYCHIC_SCREAM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => 60 - (selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 0),
      isActive: combatant => !combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.MIND_VISION,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.PURIFY_DISEASE,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHADOWFORM,
      category: Abilities.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

  ];
}

export default Abilities;
