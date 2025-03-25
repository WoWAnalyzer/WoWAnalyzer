import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import LastEmperorsCapacitorTracker from './LastEmperorsCapacitorTracker';

export default class LastEmperorsCapacitorGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    lastEmperorsTracker: LastEmperorsCapacitorTracker,
  };
  lastEmperorsTracker!: LastEmperorsCapacitorTracker;

  tracker(): LastEmperorsCapacitorTracker {
    return this.lastEmperorsTracker;
  }
}
