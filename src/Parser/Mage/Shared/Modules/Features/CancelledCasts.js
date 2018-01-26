import React from 'react';

import CoreCancelledCasts from 'Parser/Core/Modules/CancelledCasts';
import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class CancelledCasts extends CoreCancelledCasts {
  static IGNORED_ABILITIES = [
    //Include the spells that you do not want to be tracked and spells that are castable while casting (Like Fire Blast, Combustion, or Shimmer)
    SPELLS.FIRE_BLAST.id,
    SPELLS.COMBUSTION.id,
    SPELLS.SHIMMER_TALENT.id,
  ];

  get cancelledPercentage() {
    return this.castsCancelled / this.totalCasts;
  }

  get suggestionThresholds() {
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.1,
        major: 0.2,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You cancelled {formatPercentage(this.cancelledPercentage)}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible.</Wrapper>)
          .icon('inv_misc_map_01')
          .actual(`${formatPercentage(actual)}% casts cancelled`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default CancelledCasts;
