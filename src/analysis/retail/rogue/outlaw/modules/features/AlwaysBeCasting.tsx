import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    //TODO Varied for SnD and RtB?
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.25,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default AlwaysBeCasting;
