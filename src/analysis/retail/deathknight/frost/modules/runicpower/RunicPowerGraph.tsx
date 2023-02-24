import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import { RUNIC_POWER_SCALE_FACTOR } from '../../constants';
import RunicPowerTracker from './RunicPowerTracker';

const LINE_COLOR = '#5dd7fc';

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
