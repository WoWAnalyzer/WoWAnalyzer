import React from 'react';

import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
      actual,
      isGreaterThan: {
        minor,
        average,
        major,
      },
    } = this.suggestionThresholds;

    when(actual).isGreaterThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots.</React.Fragment>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  position = STATISTIC_ORDER.CORE(6);
}

export default AlwaysBeCasting;
