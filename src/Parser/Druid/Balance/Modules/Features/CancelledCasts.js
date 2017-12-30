import React from 'react';

import CoreCancelledCasts from 'Parser/Core/Modules/CancelledCasts';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class CancelledCasts extends CoreCancelledCasts {

  suggestions(when) {
    const cancelledPercentage = this.castsCancelled / this.totalCasts;

    when(cancelledPercentage).isGreaterThan(0.05)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You cancelled {formatPercentage(cancelledPercentage)}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible.</span>)
          .icon('inv_misc_map_01')
          .actual(`${formatPercentage(actual)}% casts cancelled`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(.1).major(0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default CancelledCasts;