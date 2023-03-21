import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.activeTimePercentage,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <Trans id="shared.suggestions.alwaysBeCasting.suggestion">
          Your downtime can be improved. Try to Always Be Casting (ABC), avoid delays between
          casting spells and cast instant spells when you have to move.
        </Trans>,
      )
        .icon('spell_mage_altertime')
        .actual(
          <Trans id="shared.suggestions.alwaysBeCasting.downtime">
            {formatPercentage(1 - actual)}% downtime
          </Trans>,
        )
        .recommended(`<${formatPercentage(1 - recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
