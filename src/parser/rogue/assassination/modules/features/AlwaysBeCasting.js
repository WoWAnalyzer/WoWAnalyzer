import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.45,
        major: 0.5,
      },
      style: 'percentage',
    };
  }
}

export default AlwaysBeCasting;
