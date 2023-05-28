import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import ComboPointTracker from 'analysis/retail/rogue/shared/ComboPointTracker';

export default class ComboPointGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    comboPointTracker: ComboPointTracker,
  };

  comboPointTracker!: ComboPointTracker;

  tracker() {
    return this.comboPointTracker;
  }

  // plot included in Guide
}
