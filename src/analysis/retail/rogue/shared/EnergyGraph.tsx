import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import EnergyTracker from './EnergyTracker';

export default class EnergyGraph extends ResourceGraph {
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
