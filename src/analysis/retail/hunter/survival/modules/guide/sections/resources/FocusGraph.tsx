import { FocusTracker } from 'analysis/retail/hunter/shared';
import ResourceGraph from 'parser/shared/modules/ResourceGraph';

class FocusGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    focusTracker: FocusTracker,
  };

  focusTracker!: FocusTracker;

  tracker() {
    return this.focusTracker;
  }

  // plot included in Guide
}

export default FocusGraph;
