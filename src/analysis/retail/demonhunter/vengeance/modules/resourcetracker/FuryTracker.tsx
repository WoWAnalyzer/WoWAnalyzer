import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';

export const PERFECT_TIME_AT_FURY_CAP = 0;
export const GOOD_TIME_AT_FURY_CAP = 0.05;
export const OK_TIME_AT_FURY_CAP = 0.1;

class FuryTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.FURY;
  }

  get percentAtCapPerformance(): QualitativePerformance {
    const percentAtCap = this.percentAtCap;
    if (percentAtCap === PERFECT_TIME_AT_FURY_CAP) {
      return QualitativePerformance.Perfect;
    }
    if (percentAtCap <= GOOD_TIME_AT_FURY_CAP) {
      return QualitativePerformance.Good;
    }
    if (percentAtCap <= OK_TIME_AT_FURY_CAP) {
      return QualitativePerformance.Ok;
    }
    return QualitativePerformance.Fail;
  }
}

export default FuryTracker;
