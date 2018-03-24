import CoreRuneTracker from '../../../Shared/RuneTracker';

class RuneTracker extends CoreRuneTracker{

  get suggestionThresholds() {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.10,
        average: 0.20,
        major: 0.30,
      },
      style: 'percentage',
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
      style: 'percentage',
    };
  }

} 

export default RuneTracker;