import React from 'react';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.075,
        major: 0.1,
      },
      style: 'percentage',
    };
  }
  suggestions(when) {
    const deadTimePercentage = this.downtimePercentage;

    when(deadTimePercentage).isGreaterThan(0.05)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your downtime can be improved. Try to Always Be Casting (ABC)...</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or less is recommended`)
          .regular(0.075).major(0.1);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AlwaysBeCasting;
