// import React from 'react';

// import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import CoreCastEfficiency from 'Parser/Core/Modules/CastEfficiency';
import { calculateMaxCasts } from 'Parser/Core/getCastEfficiency';

// import Voidform from '../Spells/Voidform';

// import Tab from 'Main/Tab';

// const debug = false;

// import ISSUE_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

export const SPELL_CATEGORY = {
  ROTATIONAL: 'Rotational Spell',
  COOLDOWNS: 'Cooldown',
  UTILITY: 'Utility',
  OTHERS: 'Spell',
};

class CastEfficiency extends CoreCastEfficiency {
  static CPM_ABILITIES = [
    ...CoreCastEfficiency.CPM_ABILITIES,
    {
      spell: SPELLS.VOID_BOLT,
      category: SPELL_CATEGORY.ROTATIONAL,
      recommendedCastEfficiency: 0.85,
      getCooldown: (haste, combatant) => 4.5 / (1 + haste),
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const { 
          voidformTrueUptime,
          voidformAverageHaste,
        } = parser.modules.voidform;

        const hasteFromOneBloodlust     =  30*40 / (fightDuration/1000)/100;
        const cooldownVB = 4.5 / (voidformAverageHaste + hasteFromOneBloodlust);

        return calculateMaxCasts(cooldownVB, voidformTrueUptime);
      },
    },

    {
      spell: SPELLS.DISPERSION,
      category: SPELL_CATEGORY.UTILITY,
      getCooldown: (haste, selectedCombatant) => 90 - (10 * selectedCombatant.traitsBySpellId[SPELLS.FROM_THE_SHADOWS_TRAIT.id]),
      noSuggestion: true,
      noCanBeImproved: true,
    },

    {
      spell: SPELLS.VOID_TORRENT,
      category: SPELL_CATEGORY.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 60,
    },

    {
      spell: SPELLS.MINDBENDER,
      category: SPELL_CATEGORY.COOLDOWNS,
      recommendedCastEfficiency: 0.8,
      getCooldown: haste => 60,
    },

    {
      spell: SPELLS.MIND_BLAST,
      category: SPELL_CATEGORY.ROTATIONAL,
      recommendedCastEfficiency: 0.55,
      getCooldown: haste => 4.65 / (1 + haste),
      getMaxCasts: (cooldown, fightDuration, getAbility, parser) => {
        const { 
          voidformAverageHaste,
          averageHasteOutsideVoidform,
          voidformTrueUptime,
        } = parser.modules.voidform;

        // todo: fix bloodlust casts, assuming one cast:
        const hasteFromOneBloodlust     = 30*40 / (fightDuration/1000)/100;
        const cooldownInVoidform        = 6 / (voidformAverageHaste + hasteFromOneBloodlust);
        const cooldownOutsideVoidform   = 9 / (averageHasteOutsideVoidform + hasteFromOneBloodlust);


        const maxCastsInVoidform        = calculateMaxCasts(cooldownInVoidform, voidformTrueUptime);
        const maxCastsOutsideVoidform   = calculateMaxCasts(cooldownOutsideVoidform, fightDuration - voidformTrueUptime);

        return maxCastsInVoidform + maxCastsOutsideVoidform; 
      },
    },

    {
      spell: SPELLS.ARCANE_TORRENT,
      category: SPELL_CATEGORY.COOLDOWNS,
      getCooldown: haste => 90,
      hideWithZeroCasts: true,
    },
  ];

  
}

export default CastEfficiency;
