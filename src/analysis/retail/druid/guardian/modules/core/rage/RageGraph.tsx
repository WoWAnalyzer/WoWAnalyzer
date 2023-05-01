import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import RageTracker, {
  RAGE_SCALE_FACTOR,
} from 'analysis/retail/druid/guardian/modules/core/rage/RageTracker';

const LINE_COLOR = '#DD2222';

export default class RageGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    rageTracker: RageTracker,
  };

  rageTracker!: RageTracker;

  tracker() {
    return this.rageTracker;
  }

  lineColor() {
    return LINE_COLOR;
  }

  scaleFactor() {
    return RAGE_SCALE_FACTOR;
  }

  // plot included in Guide
}
