import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class CancelledCasts extends CoreCancelledCasts {
  get Canceled() {
    return this.castsCancelled / this.totalCasts;
  }

  get CancelledPerformance(): QualitativePerformance {
    const cancel = this.Canceled;
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
