import RuneTracker from 'analysis/retail/deathknight/shared/RuneTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export default class BloodRuneTracker extends RuneTracker {
  get wastedRunePerformance(): QualitativePerformance {
    if (this.runeEfficiency >= 0.95) {
      return QualitativePerformance.Perfect;
    } else if (this.runeEfficiency >= 0.9) {
      return QualitativePerformance.Good;
    } else if (this.runeEfficiency >= 0.8) {
      return QualitativePerformance.Ok;
    } else {
      return QualitativePerformance.Fail;
    }
  }
}
