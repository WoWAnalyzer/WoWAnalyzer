import { RuneTracker as BaseRuneTracker } from '@wowanalyzer/deathknight';

import { ThresholdStyle } from 'parser/core/ParseResults';

class RuneTracker extends BaseRuneTracker {
  get suggestionThresholds() {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.10,
        average: 0.20,
        major: 0.30,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.runeEfficiency,
      isLessThan: {
        minor: 0.90,
        average: 0.80,
        major: 0.70,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default RuneTracker;
