import ResourceGraph from 'parser/shared/modules/ResourceGraph';
import AstralPowerTracker from 'analysis/retail/druid/balance/modules/core/astralpower/AstralPowerTracker';
import { ASTRAL_POWER_SCALE_FACTOR } from '../../../constants';

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
    return ASTRAL_POWER_SCALE_FACTOR;
  }
}
