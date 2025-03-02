import { defineMessage } from '@lingui/macro';
import WarriorRageDetails from 'analysis/retail/warrior/shared/modules/core/RageDetails';
import { formatPercentage } from 'common/format';
import { NumberThreshold, ThresholdStyle, When } from 'parser/core/ParseResults';

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

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
        .icon('spell_nature_reincarnation')
        .actual(
          defineMessage({
            id: 'warrior.arms.suggestions.rage.wasted',
            message: `${formatPercentage(actual)}% wasted`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RageDetails;
