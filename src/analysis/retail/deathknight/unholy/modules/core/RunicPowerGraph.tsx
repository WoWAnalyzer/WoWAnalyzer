import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import RunicPowerTracker from './RunicPowerTracker';

const LINE_COLOR = '#5dd7fc';
const RUNIC_POWER_SCALE_FACTOR = 0.1;

class RunicPowerGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    runicPowerTracker: RunicPowerTracker,
  };

  runicPowerTracker!: RunicPowerTracker;

  tracker() {
    return this.runicPowerTracker;
  }

  lineColor() {
    return LINE_COLOR;
  }

  scaleFactor() {
    return RUNIC_POWER_SCALE_FACTOR;
  }
}

export default RunicPowerGraph;
