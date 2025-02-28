import { defineMessage } from '@lingui/macro';
import WarriorRageDetails from 'analysis/retail/warrior/shared/modules/core/RageDetails';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { TALENTS_WARRIOR } from 'common/TALENTS';

class RageDetails extends WarriorRageDetails {
  hasRecklessAbandon: boolean = this.selectedCombatant.hasTalent(
    TALENTS_WARRIOR.RECKLESS_ABANDON_TALENT,
  );

  get efficiencySuggestionThresholds() {
    // Reckless Abandon cares much less about wasting rage than Anger Management does
    if (this.hasRecklessAbandon) {
      return {
        actual: this.wastedPercent,
        isGreaterThan: {
          minor: 0.75,
          average: 0.7,
          major: 0.65,
        },
        style: ThresholdStyle.PERCENTAGE,
      };
    } else {
      return {
        actual: 1 - this.wastedPercent,
        isLessThan: {
          minor: 0.95,
          average: 0.9,
          major: 0.85,
        },
        style: ThresholdStyle.PERCENTAGE,
      };
    }
  }

  get suggestionThresholds() {
    if (this.hasRecklessAbandon) {
      return {
        actual: this.wastedPercent,
        isGreaterThan: {
          minor: 0.25,
          average: 0.3,
          major: 0.35,
        },
        style: ThresholdStyle.PERCENTAGE,
      };
    } else {
      return {
        actual: this.wastedPercent,
        isGreaterThan: {
          minor: 0.08,
          average: 0.15,
          major: 0.25,
        },
        style: ThresholdStyle.PERCENTAGE,
      };
    }
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(`You wasted ${formatPercentage(this.wastedPercent)}% of your Rage.`)
        .icon('spell_nature_reincarnation')
        .actual(
          defineMessage({
            id: 'warrior.fury.suggestions.rage.wasted',
            message: `${formatPercentage(actual)}% wasted`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default RageDetails;
