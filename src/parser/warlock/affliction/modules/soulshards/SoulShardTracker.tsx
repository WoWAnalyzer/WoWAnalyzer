import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { CastEvent } from 'parser/core/Events';

class SoulShardTracker extends ResourceTracker {
  constructor(options: any) {
    super(options);
    this.resource = RESOURCE_TYPES.SOUL_SHARDS;
  }

  on_byPlayer_cast(event: CastEvent) {
    if (!this.shouldProcessCastEvent(event) || !event.classResources) {
      return;
    }
    // only processes events where there is a Soul Shard class resource info in the event
    // intentionally lower the resources because we get energize events ranging in numbers 0 - 5, not 0 - 50
    const index: any = this._getClassResourceIndex(event);
    event.classResources[index].amount /= 10;
    event.classResources[index].cost /= 10;
    event.classResources[index].max /= 10;
    super.on_byPlayer_cast && super.on_byPlayer_cast(event);
  }

  _getClassResourceIndex(event: any) {
    return Object.keys(event.classResources).find(key => event.classResources[key].type === RESOURCE_TYPES.SOUL_SHARDS) || 0;
    // "technically incorrect", if find() returns 0 as a valid index, it also gets evaluated as "false", but || 0 makes it 0 anyway so it's fine
  }
}

export default SoulShardTracker;
