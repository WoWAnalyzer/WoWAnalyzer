import React from 'react';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import CoreAlwaysBeCasting from 'parser/core/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
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
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment> Your downtime can be improved. Try to Always Be Casting (ABC)...</React.Fragment>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`${formatPercentage(recommended)}% or less is recommended`);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AlwaysBeCasting;
