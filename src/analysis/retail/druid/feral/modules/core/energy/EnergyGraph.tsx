import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import EnergyTracker from 'analysis/retail/druid/feral/modules/core/energy/EnergyTracker';

class EnergyGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    energyTracker: EnergyTracker,
  };

  energyTracker!: EnergyTracker;

  tracker() {
    return this.energyTracker;
  }

  // plot included in Guide
}

export default EnergyGraph;
