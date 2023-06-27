import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';

class CancelledCasts extends CoreCancelledCasts {
  get cancelledCastSuggestionThresholds() {
    // Override of default suggestions
    return {
      actual: this.cancelledPercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.075,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.cancelledCastSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Your cancelled casts can be improved. While it is expected to cancel a few casts to react
          to a boss mechanic or to move, you should try to ensure that you are cancelling as few
          casts as possible.
        </>,
      )
        .icon('inv_misc_map_01')
        .actual(`${formatPercentage(actual)}% casts cancelled`)
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default CancelledCasts;
