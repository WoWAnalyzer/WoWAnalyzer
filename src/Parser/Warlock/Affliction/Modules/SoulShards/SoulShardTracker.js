import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class SoulShardTracker extends ResourceTracker {
  on_initialized() {
    this.resource = RESOURCE_TYPES.SOUL_SHARDS;
  }

  on_byPlayer_cast(event) {
    if (!this.shouldProcessCastEvent(event)) {
      return;
    }
    // only processes events where there is a Soul Shard class resource info in the event
    // intentionally lower the resources because we get energize events ranging in numbers 0 - 5, not 0 - 50
    const index = this._getClassResourceIndex(event);
    event.classResources[index].amount /= 10;
    event.classResources[index].cost /= 10;
    event.classResources[index].max /= 10;
    super.on_byPlayer_cast && super.on_byPlayer_cast(event);
  }

  _getClassResourceIndex(event) {
    return Object.keys(event.classResources).find(key => event.classResources[key].type === RESOURCE_TYPES.SOUL_SHARDS) || 0;
    // "technically incorrect", if find() returns 0 as a valid index, it also gets evaluated as "false", but || 0 makes it 0 anyway so it's fine
  }

  getGeneratedBySpell(spellId) {
    return (this.buildersObj[spellId] && this.buildersObj[spellId].generated) || 0;
  }
}

export default SoulShardTracker;
