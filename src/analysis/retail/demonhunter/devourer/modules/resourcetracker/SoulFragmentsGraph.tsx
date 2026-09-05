import BuffStackGraph from 'parser/shared/modules/BuffStackGraph';
import SoulFragmentBuffStackTracker from './SoulFragmentBuffStackTracker';

export default class SoulFragmentsGraph extends BuffStackGraph {
  static dependencies = {
    ...BuffStackGraph.dependencies,
    soulFragmentBuffStackTracker: SoulFragmentBuffStackTracker,
  };

  soulFragmentBuffStackTracker!: SoulFragmentBuffStackTracker;

  tracker() {
    return this.soulFragmentBuffStackTracker;
  }

  // plot included in Guide
}
