import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';

/* eslint-disable no-unused-vars */

const debug = false;

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    // Rotational Spells
    {
      spell: SPELLS.MANGLE_BEAR,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.BEAR_SWIPE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.MOONFIRE,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.THRASH_BEAR,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: (haste, combatant) => {
        const hasMightBuff = combatant.hasTalent(SPELLS.INCARNATION_OF_URSOC.id);
        if (!hasMightBuff) {
          return 6;
        }

        const fightDuration = combatant.owner.fightDuration / 1000;
        const mightBuff = Math.ceil(fightDuration / 180);
        const castsDuringMight = (mightBuff * 30) / (1.5 / (1 + haste));
        const castsOutsideMight = (fightDuration - (mightBuff * 30)) / (6 / (1 + haste));
        return fightDuration / (castsDuringMight + castsOutsideMight);
      },
      noSuggestion: true,
    },
    {
      spell: SPELLS.MAUL,
      category: CastEfficiency.SPELL_CATEGORIES.ROTATIONAL,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    // Cooldowns
    {
      spell: SPELLS.BARKSKIN,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 90 - (90 / 3) : 90;
        const cdTrait = combatant.traitsBySpellId[SPELLS.PERPETUAL_SPRING_TRAIT.id] || 0;
        debug && console.log(`Barkskin CD ${baseCd * (1 - (cdTrait * 3 / 100))}`);
        return baseCd * (1 - (cdTrait * 3 / 100));
      },
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SURVIVAL_INSTINCTS,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
        debug && console.log(`Survival CD ${baseCd}`);
        return baseCd;
      },
      charges: 3,
      isActive: combatant => combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.SURVIVAL_INSTINCTS,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: (haste, combatant) => {
        const baseCd = combatant.hasTalent(SPELLS.SURVIVAL_OF_THE_FITTEST_TALENT.id) ? 240 - (240 / 3) : 240;
        debug && console.log(`Survival CD ${baseCd}`);
        return baseCd;
      },
      charges: 2,
      isActive: combatant => !combatant.hasFinger(ITEMS.DUAL_DETERMINATION.id),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.INCARNATION_OF_URSOC,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 180,
      isActive: combatant => combatant.hasTalent(SPELLS.INCARNATION_OF_URSOC.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.BRISTLING_FUR_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 40,
      isActive: combatant => combatant.hasTalent(SPELLS.BRISTLING_FUR_TALENT.id),
      noSuggestion: true,
    },
    {
      spell: SPELLS.IRONFUR,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.RAGE_OF_THE_SLEEPER,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => 90,
      noSuggestion: true,
    },
    {
      spell: SPELLS.FRENZIED_REGENERATION,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.PULVERIZE_TALENT,
      category: CastEfficiency.SPELL_CATEGORIES.COOLDOWNS,
      getCooldown: haste => null,
      isActive: combatant => combatant.hasTalent(SPELLS.PULVERIZE_TALENT.id),
      noSuggestion: true,
    },
    // Raid utility
    {
      spell: SPELLS.STAMPEDING_ROAR_BEAR,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: (haste, combatant) => (combatant.hasTalent(SPELLS.GUTTURAL_ROARS_TALENT.id) ? 60 : 120),
      noSuggestion: true,
      noCanBeImproved: true,
    },
    {
      spell: SPELLS.GROWL,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
    },
    {
      spell: SPELLS.SKULL_BASH,
      category: CastEfficiency.SPELL_CATEGORIES.UTILITY,
      getCooldown: haste => null,
      noSuggestion: true,
    },

    //To Do: Finish adding spells.

  ];
}

export default CastEfficiency;
