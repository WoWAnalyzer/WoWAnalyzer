import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        `You cancelled ${formatPercentage(
          actual,
        )}% of your spells. While it is expected that you will have to cancel a few casts to react to a boss mechanic or to move, you should try to ensure that you are cancelling as few casts as possible.`,
      )
        .icon('inv_misc_map_01')
        .actual(
          t({
            id: 'evoker.devastation.suggestions.castsCancelled',
            message: `${formatPercentage(actual)}% casts cancelled`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  get Canceled() {
    return this.castsCancelled / this.totalCasts;
  }

  get CancelledPerformance(): QualitativePerformance {
    const cancel = this.Canceled;
    if (cancel <= 0.01) {
      return QualitativePerformance.Perfect;
    }
    if (cancel <= 0.075) {
      return QualitativePerformance.Good;
    }
    if (cancel <= 0.1) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default CancelledCasts;
