import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds(): NumberThreshold {
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
}

export default AlwaysBeCasting;
