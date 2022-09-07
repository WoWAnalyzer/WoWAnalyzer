import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get downtimePercentage() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.3,
        major: 0.4,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay
          between casting spells.
        </span>,
      )
        .icon('spell_mage_altertime')
        .actual(
          t({
            id: 'monk.windwalker.alwaysBeCasting.downtime',
            message: `${formatPercentage(actual)}% downtime`,
          }),
        )
        .recommended(`<${formatPercentage(recommended)}% is recommended`),
    );
  }

  position = STATISTIC_ORDER.CORE(10);
}

export default AlwaysBeCasting;
