import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
// import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

  static BASE_GCD = 1000;
  static MINIMUM_GCD = 1000;

  static ABILITIES_ON_GCD = [
    SPELLS.RAKE.id,
    SPELLS.RIP.id,
    SPELLS.SHRED.id,
    SPELLS.CAT_SWIPE.id,
    SPELLS.FEROCIOUS_BITE.id,
    SPELLS.SAVAGE_ROAR_TALENT.id,
    SPELLS.ASHAMANES_FRENZY.id,
    SPELLS.REGROWTH.id,
    SPELLS.MAIM.id,
    SPELLS.THRASH_BEAR.id,

    SPELLS.MIGHTY_BASH_TALENT.id,
    SPELLS.DISPLACER_BEAST_TALENT.id,
    SPELLS.TYPHOON_TALENT.id,
    SPELLS.MASS_ENTANGLEMENT_TALENT.id,

    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.TRAVEL_FORM.id,
    SPELLS.STAG_FORM.id,
  ];

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
