import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class RunicPowerTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;
  }

  getAdjustedCost(event: CastEvent) {
    const cost = this.getResource(event)?.cost;
    if (cost) {
      return cost / 10;
    }
  }
}

export default RunicPowerTracker;
