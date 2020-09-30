import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Event } from 'parser/core/Events';

class PainTracker extends ResourceTracker {
  constructor(options: any) {
    super(options);
    this.resource = RESOURCE_TYPES.PAIN;
  }

  getReducedCost(event: Event<any>) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    return this.getResource(event).cost / 10;
  }
}

export default PainTracker;
