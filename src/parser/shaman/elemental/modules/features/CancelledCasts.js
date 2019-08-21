import React from 'react';

import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class CancelledCasts extends CoreCancelledCasts {
  static IGNORED_ABILITIES = [
    SPELLS.WIND_SHEAR.id,
  ]

  get cancelledPercentage() {
    return this.castsCancelled / this.totalCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.10,
        major: 0.15,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<>You cancelled {formatPercentage(this.cancelledPercentage)}% ({this.castsCancelled} / {this.totalCasts}) of your spells. While it is expected that you will have to cancel a few casts to react to boss mechanics or move, you should try to ensure that you are minimizing your movement with proper planning.</>)
          .icon('inv_misc_map_01')
          .actual(`${formatPercentage(actual)}% casts cancelled`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default CancelledCasts;