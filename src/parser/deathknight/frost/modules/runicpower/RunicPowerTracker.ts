import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';

class RunicPowerTracker extends ResourceTracker {
  constructor(options: any) {
    super(options);
    this.resource = RESOURCE_TYPES.RUNIC_POWER;
  }

  getReducedCost(event: any) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    return this.getResource(event).cost / 10;
  }
}

export default RunicPowerTracker;
