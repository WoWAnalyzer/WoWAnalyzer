import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

class FuryTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.FURY;
  }

  get percentAtCapPerformance(): QualitativePerformance {
    const percentAtCap = this.percentAtCap;
    if (percentAtCap === 0) {
      return QualitativePerformance.Perfect;
    }
    if (percentAtCap <= 0.05) {
      return QualitativePerformance.Good;
    }
    if (percentAtCap <= 0.1) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default FuryTracker;
