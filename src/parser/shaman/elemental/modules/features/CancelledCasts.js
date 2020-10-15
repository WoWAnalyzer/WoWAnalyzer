import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

class CancelledCasts extends CoreCancelledCasts {
  get suggestionThresholds() {
    return {
      actual: this.castsCancelled / this.totalCasts,
      isGreaterThan: {
        minor: 0.05,
        average: 0.075,
        major: 0.1,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(`${formatPercentage(actual)}% of spells casts were cancelled. Some casts will likely need to be cancelled due to mechanics, but generally, it is rarely a DPS up to cancel a cast in favor of casting another spell.`)
          .icon('inv_misc_map_01')
          .actual(i18n._(t('shaman.elemental.suggestions.castsCancelled')`${formatPercentage(actual)}% casts cancelled`))
          .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default CancelledCasts;
