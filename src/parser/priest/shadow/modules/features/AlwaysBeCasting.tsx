import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
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
          .actual(i18n._(t('priest.shadow.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  position = STATISTIC_ORDER.CORE(6);
}

export default AlwaysBeCasting;
