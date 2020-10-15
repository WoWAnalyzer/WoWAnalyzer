import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.075,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest('Your downtime can be improved. Try to Always Be Casting (ABC)...')
          .icon('spell_mage_altertime')
          .actual(i18n._(t('druid.balance.suggestions.alwaysBeCasting.downtime')`${formatPercentage(actual)}% downtime`))
          .recommended(`${formatPercentage(recommended)}% or less is recommended`));
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default AlwaysBeCasting;
