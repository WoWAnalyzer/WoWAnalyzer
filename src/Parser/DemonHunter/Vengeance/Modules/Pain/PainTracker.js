import RESOURCE_TYPES from 'Game/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';

class PainTracker extends ResourceTracker {

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.PAIN;
  }

  getReducedCost(event) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    return this.getResource(event).cost / 10;
  }
}

export default PainTracker;
