import { ThresholdStyle } from 'parser/core/ParseResults';
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
