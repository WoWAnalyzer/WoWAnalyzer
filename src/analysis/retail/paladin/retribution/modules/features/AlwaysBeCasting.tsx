import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { ThresholdStyle } from 'parser/core/ParseResults';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  static icons = {
    activeTime: '/img/wheelchair.png',
    downtime: '/img/afk.png',
  };
  position = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
