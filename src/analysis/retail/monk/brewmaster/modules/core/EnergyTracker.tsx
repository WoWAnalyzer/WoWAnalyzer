import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import {
  QualitativePerformance,
  evaluateQualitativePerformanceByThreshold,
} from 'parser/ui/QualitativePerformance';

const MAX_ENERGY = 100;
const BASE_REGEN = 10;

export default class EnergyTracker extends ResourceTracker {
  static dependencies = { ...ResourceTracker.dependencies };
  constructor(options: Options) {
    super(options);

    this.resource = RESOURCE_TYPES.ENERGY;
    this.maxResource = MAX_ENERGY;
    this.baseRegenRate = BASE_REGEN;

    // brew can't normally miss so it is hard to validate this, but it probably works this way
    this.refundOnMiss = true;
  }

  get performance(): QualitativePerformance {
    return evaluateQualitativePerformanceByThreshold({
      actual: this.percentAtCap,
      isLessThanOrEqual: {
        perfect: 0.05,
        good: 0.1,
        ok: 0.15,
        fail: 0.2,
      },
    });
  }
}
