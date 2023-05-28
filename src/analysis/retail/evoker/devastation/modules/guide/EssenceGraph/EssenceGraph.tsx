import EssenceTracker from 'analysis/retail/evoker/preservation/modules/features/EssenceTracker';
import ResourceGraph from 'parser/shared/modules/ResourceGraph';

class EssenceGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    essenceTracker: EssenceTracker,
  };

  lineColor() {
    return '#33937F';
  }

  tracker() {
    return this.essenceTracker;
  }

  essenceTracker!: EssenceTracker;
}

export default EssenceGraph;
