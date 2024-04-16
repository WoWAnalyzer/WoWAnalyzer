import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(6);

  get DowntimePerformance(): QualitativePerformance {
    const downtime = this.downtimePercentage;
    if (downtime <= 0.05) {
      return QualitativePerformance.Perfect;
    }
    if (downtime <= 0.1) {
      return QualitativePerformance.Good;
    }
    if (downtime <= 0.2) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default AlwaysBeCasting;
