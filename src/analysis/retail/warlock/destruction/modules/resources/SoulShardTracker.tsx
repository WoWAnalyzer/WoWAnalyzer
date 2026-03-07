import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class SoulShardTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.SOUL_SHARDS;
  }

  onCast(event: CastEvent) {
    const classResources = this.getResource(event);
    if (classResources) {
      classResources.amount /= 10;
      classResources.cost = classResources.cost ? classResources.cost / 10 : 0;
      classResources.max /= 10;
      super.onCast(event);
    }
  }
}

export default SoulShardTracker;
