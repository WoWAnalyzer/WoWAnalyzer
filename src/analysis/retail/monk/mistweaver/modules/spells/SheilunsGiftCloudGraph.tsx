import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import SheilunsGiftCloudTracker from './SheilunsGiftCloudTracker';

export default class SheilunsGiftCloudGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    cloudTracker: SheilunsGiftCloudTracker,
  };
  cloudTracker!: SheilunsGiftCloudTracker;

  tracker(): SheilunsGiftCloudTracker {
    return this.cloudTracker;
  }
}
