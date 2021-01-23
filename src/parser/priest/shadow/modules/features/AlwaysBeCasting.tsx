import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  position = STATISTIC_ORDER.CORE(6);

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.1,
        average: 0.15,
        major: 0.2,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => suggest('Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting something instant - maybe refresh your dots.')
        .icon('spell_mage_altertime')
        .actual(t({
      id: "priest.shadow.suggestions.alwaysBeCasting.downtime",
      message: `${formatPercentage(actual)}% downtime`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }
}

export default AlwaysBeCasting;
