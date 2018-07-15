import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

  get suggestionThresholds() {
    return {
      actual: this.totalTimeWasted / this.owner.fightDuration,
      isGreaterThan: {
        minor: 0.45,
        average: 0.40,
        major: 0.30,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>
            Your downtime can be improved. Although it's normal to need to wait for energy to regenerate, so long spent not using any abilities indicates you're missing out on chances to deal damage.
          </React.Fragment>
        )
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
