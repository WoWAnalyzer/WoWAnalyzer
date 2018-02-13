import CoreRuneTracker from '../../../Shared/RuneTracker';

class RuneTracker extends CoreRuneTracker{

  get suggestionThresholds() {
    return {
      actual: 1 - this.runeEfficiency,
      isGreaterThan: {
        minor: 0.15,
        average: 0.25,
        major: 0.35,
      },
      style: 'percentage',
    };
  }

  get suggestionThresholdsEfficiency() {
    return {
      actual: this.runeEfficiency,
      isLessThan: {
        minor: 0.85,
        average: 0.75,
        major: 0.65,
      },
      style: 'percentage',
    };
  }

} 

export default RuneTracker;