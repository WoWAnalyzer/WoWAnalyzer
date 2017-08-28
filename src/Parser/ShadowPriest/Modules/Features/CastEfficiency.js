import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    

    {
      spell: SPELLS.VOID_BOLT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      recommendedCastEfficiency: 0.85,
      getCooldown: (haste, combatant) => 4.5 / (1 + haste),
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const { averageVoidformHaste } = parser.modules.voidform;

        // const hasteFromOneBloodlust     =  30*40 / (fightDuration/1000)/100;
        const cooldownVoidBolt          = 4.5 / averageVoidformHaste;

        return calculateMaxCasts(cooldownVoidBolt, parser.selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));
      },
    },

    {
      spell: SPELLS.MIND_BLAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => !combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id),
      recommendedCastEfficiency: 0.55,
      getCooldown: haste => 4.65 / (1 + haste),
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const { 
          averageVoidformHaste,
          averageNonVoidformHaste,
        } = parser.modules.voidform;

        // todo: fix bloodlust casts, assuming one cast:
        // const hasteFromOneBloodlust     = 30*40 / (fightDuration/1000)/100;
        const cooldownInVoidform        = 6 / (averageVoidformHaste);
        const cooldownOutsideVoidform   = 9 / (averageNonVoidformHaste);


        const maxCastsInVoidform        = calculateMaxCasts(cooldownInVoidform, parser.selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));
        const maxCastsOutsideVoidform   = calculateMaxCasts(cooldownOutsideVoidform, fightDuration - parser.selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));

        return maxCastsInVoidform + maxCastsOutsideVoidform; 
      },
    },

    {
      spell: SPELLS.MIND_BLAST,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      isActive: combatant => combatant.hasWaist(ITEMS.MANGAZAS_MADNESS.id),
      recommendedCastEfficiency: 0.85,
      getCooldown: haste => 4.65 / (1 + haste),
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const { 
          averageVoidformHaste,
          averageNonVoidformHaste,
        } = parser.modules.voidform;

        // todo: fix bloodlust casts, assuming one cast:
        // const hasteFromOneBloodlust     = 30*40 / (fightDuration/1000)/100;
        const cooldownInVoidform        = 6 / (averageVoidformHaste);
        const cooldownOutsideVoidform   = 9 / (averageNonVoidformHaste);


        const maxCastsInVoidform        = calculateMaxCasts(cooldownInVoidform, parser.selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));
        const maxCastsOutsideVoidform   = calculateMaxCasts(cooldownOutsideVoidform, fightDuration - parser.selectedCombatant.getBuffUptime(SPELLS.VOIDFORM_BUFF.id));

        return maxCastsInVoidform + maxCastsOutsideVoidform; 
      },
    },

    {
      spell: SPELLS.MIND_FLAY,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHADOW_WORD_DEATH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      noCanBeImproved: true,
      noSuggestion: true,
      getCooldown: haste => 9,
    },

    {
      spell: SPELLS.SHADOW_WORD_VOID_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 20,
      isActive: combatant => combatant.hasTalent(SPELLS.SHADOW_WORD_VOID_TALENT.id),
    },

    {
      spell: SPELLS.SHADOW_WORD_PAIN,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.VAMPIRIC_TOUCH,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.VOID_ERUPTION,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },


    // Cooldowns
    {
      spell: SPELLS.VOID_TORRENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.9,
      getCooldown: haste => 60,
    },

    {
      spell: SPELLS.MINDBENDER_TALENT_SHADOW,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 60,
      isActive: combatant => combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
    },

    {
      spell: SPELLS.SHADOWFIEND,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 180,
      isActive: combatant => !combatant.hasTalent(SPELLS.MINDBENDER_TALENT_SHADOW.id),
    },

    {
      spell: SPELLS.POWER_INFUSION_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 120,
      isActive: combatant => combatant.hasTalent(SPELLS.POWER_INFUSION_TALENT.id),
    },

    {
      spell: SPELLS.SHADOW_CRASH_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.SHADOW_CRASH_TALENT.id),
    },

    {
      spell: SPELLS.SURRENDER_TO_MADNESS_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 600,
      noSuggestion: true,
      noCanBeImproved: true,
      isActive: combatant => combatant.hasTalent(SPELLS.SURRENDER_TO_MADNESS_TALENT.id),
    },


    // Utility
    {
      spell: SPELLS.DISPERSION,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => 90 - (10 * selectedCombatant.traitsBySpellId[SPELLS.FROM_THE_SHADOWS_TRAIT.id]),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    

    {
      spell: SPELLS.SILENCE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 45,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.MIND_BOMB_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      isActive: combatant => combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.VAMPIRIC_EMBRACE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 180,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.POWER_WORD_SHIELD,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 7.5 / (1 + haste),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHADOW_MEND,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.FADE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 30,
      noSuggestion: true,
      noCanBeImproved: true,
    },


    {
      spell: SPELLS.ARCANE_TORRENT,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 90,
      hideWithZeroCasts: true,
    },
    
    {
      spell: SPELLS.MASS_DISPEL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 15,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.DISPEL_MAGIC,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.MIND_CONTROL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => (selectedCombatant.hasTalent(SPELLS.DOMINANT_MIND_TALENT.id) ? 120 : 0),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHACKLE_UNDEAD,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.PSYCHIC_SCREAM,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, selectedCombatant) => 60 - (selectedCombatant.hasTalent(SPELLS.PSYCHIC_VOICE_TALENT.id) ? 30 : 0),
      isActive: combatant => !combatant.hasTalent(SPELLS.MIND_BOMB_TALENT.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    

    {
      spell: SPELLS.MIND_VISION,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.PURIFY_DISEASE,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => 8,
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.SHADOWFORM,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
      noCanBeImproved: true,
    },


  ];

  
}

export default CastEfficiency;
