import { EnergyTracker } from 'analysis/retail/rogue/shared';
import Analyzer from 'parser/core/Analyzer';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
  };
  protected energyTracker!: EnergyTracker;
}

export default Energy;
