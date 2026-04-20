import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class CancelledCasts extends CoreCancelledCasts {
  get canceled() {
    return this.castsCancelled / this.totalCasts;
  }

  get cancelledPerformance(): QualitativePerformance {
    const cancel = this.canceled;
    if (cancel <= 0.01) {
      return QualitativePerformance.Perfect;
    }
    if (cancel <= 0.05) {
      return QualitativePerformance.Good;
    }
    if (cancel <= 0.1) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default CancelledCasts;
