import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import HolyPowerTracker from '../../../shared/HolyPowerTracker';

class HolyPowerGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    holyPowerTracker: HolyPowerTracker,
  };

  holyPowerTracker!: HolyPowerTracker;

  tracker() {
    return this.holyPowerTracker;
  }

  // plot included in Guide
}

export default HolyPowerGraph;
