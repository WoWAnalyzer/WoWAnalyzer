import { EnergyTracker, EnergyCapTracker } from 'analysis/retail/rogue/shared';
import Analyzer from 'parser/core/Analyzer';
import { ThresholdStyle } from 'parser/core/ParseResults';

class Energy extends Analyzer {
  static dependencies = {
    energyTracker: EnergyTracker,
    energyCapTracker: EnergyCapTracker,
  };

  protected energyTracker!: EnergyTracker;
  protected energyCapTracker!: EnergyCapTracker;

  get energyThresholds() {
    return {
      actual: this.energyTracker.wasted / this.energyTracker.generated,
      isGreaterThan: {
        minor: 0.033,
        average: 0.066,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default Energy;
