import React from 'react';

import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  static ABILITIES_ON_GCD = [
    // Guardian:
    SPELLS.MANGLE_BEAR.id,
    SPELLS.THRASH_BEAR.id,
    SPELLS.BEAR_SWIPE.id,
    SPELLS.MOONFIRE.id,
    SPELLS.MAUL.id,
    SPELLS.BEAR_FORM.id,
    SPELLS.CAT_FORM.id,
    SPELLS.MOONKIN_FORM.id,
    SPELLS.INCAPACITATING_ROAR.id,
    SPELLS.STAMPEDING_ROAR_BEAR.id,
    SPELLS.STAMPEDING_ROAR_CAT.id,

    // Talents
    SPELLS.INTIMIDATING_ROAR_TALENT.id,
    SPELLS.TYPHOON_TALENT.id,
    SPELLS.PULVERIZE_TALENT.id,
    SPELLS.MIGHTY_BASH_TALENT.id,
    SPELLS.MASS_ENTANGLEMENT_TALENT.id,
    SPELLS.WILD_CHARGE_TALENT.id,
  ];

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC).</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default AlwaysBeCasting;
