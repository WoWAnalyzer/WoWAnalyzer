import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

  // Feral has some spells with base GCD of 1500, some with 1000. The base 1000 spells are rotational, so show that until we can do both.
  static BASE_GCD = 1000;
  static MINIMUM_GCD = 750;

  // Feral has abilities with 3 distinct GCD durations:
 /* 1000 GCD reduced by haste
    SPELLS.REGROWTH.id,
    SPELLS.ENTANGLING_ROOTS.id,
    SPELLS.MOONFIRE_FERAL.id,
  */
 /* 1500 GCD reduced by haste
    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.TRAVEL_FORM.id,
    SPELLS.STAG_FORM.id,
  */
  static STATIC_GCD_ABILITIES = {
    [SPELLS.RAKE.id]: 1000,
    [SPELLS.RIP.id]: 1000,
    [SPELLS.SHRED.id]: 1000,
    [SPELLS.FEROCIOUS_BITE.id]: 1000,
    [SPELLS.SAVAGE_ROAR_TALENT.id]: 1000,
    [SPELLS.ASHAMANES_FRENZY.id]: 1000,
    [SPELLS.MAIM.id]: 1000,
    [SPELLS.CAT_SWIPE.id]: 1000,
    [SPELLS.THRASH_FERAL.id]: 1000,
    [SPELLS.BRUTAL_SLASH_TALENT.id]: 1000,
  };

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
