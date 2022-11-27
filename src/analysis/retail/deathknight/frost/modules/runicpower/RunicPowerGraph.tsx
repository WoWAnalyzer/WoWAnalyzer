import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import RunicPowerTracker from './RunicPowerTracker';

const LINE_COLOR = '#5dd7fc';
const SCALE_FACTOR = 0.1; // in events all values are x10

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
    return SCALE_FACTOR;
  }
}

export default RunicPowerGraph;
