import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import AstralPowerTracker from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerTracker';

const SCALE_FACTOR = 0.1; // in events all values are x10

export default class AstralPowerGraph extends ResourceGraph {
  static dependencies = {
    ...ResourceGraph.dependencies,
    astralPowerTracker: AstralPowerTracker,
  };

  astralPowerTracker!: AstralPowerTracker;

  tracker() {
    return this.astralPowerTracker;
  }

  scaleFactor() {
    return SCALE_FACTOR;
  }
}
