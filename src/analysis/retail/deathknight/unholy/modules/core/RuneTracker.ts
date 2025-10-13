import { RuneTracker as BaseRuneTracker } from 'analysis/retail/deathknight/shared';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';

class RuneTracker extends BaseRuneTracker {
  get suggestionThresholds(): NumberThreshold {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsEfficiency(): NumberThreshold {
    return {
      actual: this.runeEfficiency,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default RuneTracker;
