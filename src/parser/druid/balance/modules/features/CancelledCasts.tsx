import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';

class CancelledCasts extends CoreCancelledCasts {
  get suggestionThresholds() {
    return {
      actual: this.castsCancelled / this.totalCasts,
      isGreaterThan: {
        minor: 0.05,
        average: 0.075,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  statisticOrder = STATISTIC_ORDER.CORE(8);

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest(`You cancelled ${formatPercentage(actual)}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible.`)
        .icon('inv_misc_map_01')
        .actual(t({
        id: "druid.balance.suggestions.castsCancelled",
        message: `${formatPercentage(actual)}% casts cancelled`
      }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }
}

export default CancelledCasts;
