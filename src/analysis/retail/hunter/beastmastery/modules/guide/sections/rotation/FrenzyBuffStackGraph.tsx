import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import FrenzyBuffStackTracker from './FrenzyBuffStackTracker';

export default class FrenzyBuffStackGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    frenzyBuffStackTracker: FrenzyBuffStackTracker,
  };

  frenzyBuffStackTracker!: FrenzyBuffStackTracker;

  tracker() {
    return this.frenzyBuffStackTracker;
  }

  // plot included in Guide
}
