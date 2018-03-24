import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';

class RunicPowerTracker extends ResourceTracker {

  on_initialized() {
    this.resource = RESOURCE_TYPES.RUNIC_POWER;
  }

  getReducedCost(event) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    return this.getResource(event).cost / 10;
  }
}

export default RunicPowerTracker;
