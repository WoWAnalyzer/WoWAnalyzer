import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

class SoulShardTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.SOUL_SHARDS;
  }

  onCast(event) {
    if (!this.shouldProcessCastEvent(event)) {
      return;
    }
    // only processes events where there is a Soul Shard class resource info in the event
    // intentionally lower the resources because we get energize events ranging in numbers 0 - 5, not 0 - 50
    const index = this._getClassResourceIndex(event);
    event.classResources[index].amount /= 10;
    event.classResources[index].cost /= 10;
    event.classResources[index].max /= 10;
    super.onCast && super.onCast(event);
  }

  _getClassResourceIndex(event) {
    return Object.keys(event.classResources).find(key => event.classResources[key].type === RESOURCE_TYPES.SOUL_SHARDS) || 0;
    // "technically incorrect", if find() returns 0 as a valid index, it also gets evaluated as "false", but || 0 makes it 0 anyway so it's fine
  }
}

export default SoulShardTracker;
