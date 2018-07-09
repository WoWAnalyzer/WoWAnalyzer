import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    //TODO Varied for SnD and RtB?
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.25,
        major: 0.3,
      },
      style: 'percentage',
    };
  }
}

export default AlwaysBeCasting;
