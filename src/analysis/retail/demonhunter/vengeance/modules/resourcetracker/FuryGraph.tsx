import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import FuryTracker from './FuryTracker';

export default class FuryGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    furyTracker: FuryTracker,
  };

  furyTracker!: FuryTracker;

  tracker() {
    return this.furyTracker;
  }

  // plot included in Guide
}
