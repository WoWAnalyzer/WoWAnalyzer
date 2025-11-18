import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimePercentage() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  position = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCasting;
