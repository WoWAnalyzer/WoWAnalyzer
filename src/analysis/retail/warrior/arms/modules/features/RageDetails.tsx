import WarriorRageDetails from 'analysis/retail/warrior/shared/modules/core/RageDetails';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';

class RageDetails extends WarriorRageDetails {
  // Arms doesn't really care about wasting rage
  // except kind of during execute
  // but that's handled by the Skullsplitter and OP APL rules
  get efficiencySuggestionThresholds(): NumberThreshold {
    return {
      actual: 1 - this.wastedPercent,
      isLessThan: {
        minor: 0.75,
        average: 0.7,
        major: 0.65,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.wastedPercent,
      isGreaterThan: {
        minor: 0.25,
        average: 0.3,
        major: 0.35,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
}

export default RageDetails;
