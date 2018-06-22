import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

class SoulShardTrackerV2 extends ResourceTracker {
  on_initialized() {
    this.resource = RESOURCE_TYPES.SOUL_SHARDS;
  }

  on_toPlayer_energize(event) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    if (event.resourceChange < 10) {
      // so far all Warlock energize events have resourceChange 1 - 5
      // classResources are in 0 - 50 range, we need to get resourceChange to same order of magnitude
      event.resourceChange = event.resourceChange * 10;
    }
    super.on_toPlayer_energize && super.on_toPlayer_energize(event);
  }
}

export default SoulShardTrackerV2;
