import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';

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
}

export default CancelledCasts;
