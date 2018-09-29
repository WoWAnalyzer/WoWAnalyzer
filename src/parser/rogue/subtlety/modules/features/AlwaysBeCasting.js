import CoreAlwaysBeCasting from 'parser/core/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.25,
        average: 0.30,
        major: 0.35,
      },
      style: 'percentage',
    };
  }
}

export default AlwaysBeCasting;
