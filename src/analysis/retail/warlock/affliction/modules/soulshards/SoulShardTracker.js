import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class SoulShardTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.SOUL_SHARDS;
  }

  onCast(event) {
    const classResources = this.getResource(event);
    if (classResources) {
      // event resource amounts in cast are 10x what they should be for some reason (range 0-50)
      classResources.amount /= 10;
      classResources.cost /= 10;
      classResources.max /= 10;
      super.onCast(event);
    }
  }
}

export default SoulShardTracker;
