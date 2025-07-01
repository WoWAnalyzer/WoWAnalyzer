import { RuneTracker as BaseRuneTracker } from 'analysis/retail/deathknight/shared';
import { ThresholdStyle } from 'parser/core/ParseResults';

class RuneTracker extends BaseRuneTracker {
  get suggestionThresholds() {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.1,
        average: 0.2,
        major: 0.3,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.runeEfficiency,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.7,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default RuneTracker;
