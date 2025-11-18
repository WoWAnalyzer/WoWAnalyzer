import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(1);

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.125,
        average: 0.175,
        major: 0.225,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default AlwaysBeCasting;
