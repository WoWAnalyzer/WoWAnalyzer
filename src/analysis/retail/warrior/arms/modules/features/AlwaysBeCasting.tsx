import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { ThresholdStyle } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { When } from 'parser/core/ParseResults';
import SPELLS from 'common/SPELLS';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.15,
        average: 0.2,
        major: 0.25,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.downtimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        'Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells.',
      )
        .icon(SPELLS.ALTER_TIME_BUFF.icon)
        .actual(
          t({
            id: 'warrior.arms.suggestions.alwaysBeCasting.downtime',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }
}

export default AlwaysBeCasting;
