import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import BlisteringScalesStackTracker from './BlisteringScalesStackTracker';

export default class BlisteringScalesGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    blisteringScalesStackTracker: BlisteringScalesStackTracker,
  };

  blisteringScalesStackTracker!: BlisteringScalesStackTracker;

  tracker() {
    return this.blisteringScalesStackTracker;
  }

  // plot included in Guide
}
