import CoreCancelledCasts from 'parser/shared/modules/CancelledCasts';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';

class CancelledCasts extends CoreCancelledCasts {
  statisticOrder = STATISTIC_ORDER.CORE(8);

  get suggestionThresholds() {
    return {
      actual: this.castsCancelled / this.totalCasts,
      isGreaterThan: {
        minor: 0.05,
        average: 0.075,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(`${formatPercentage(actual)}% of spells casts were cancelled. Some casts will likely need to be cancelled due to mechanics, but generally, it is rarely a DPS up to cancel a cast in favor of casting another spell.`)
      .icon('inv_misc_map_01')
      .actual(t({
      id: "shaman.elemental.suggestions.castsCancelled",
      message: `${formatPercentage(actual)}% casts cancelled`
    }))
      .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }
}

export default CancelledCasts;
