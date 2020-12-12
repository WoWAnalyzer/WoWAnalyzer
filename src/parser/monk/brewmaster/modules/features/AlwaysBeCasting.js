import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { t } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  statisticOrder = STATISTIC_ORDER.CORE(10);

  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => suggest('Your downtime can be improved. Try to Always Be Casting (ABC).')
        .icon('spell_mage_altertime')
        .actual(t({
      id: "monk.brewmaster.suggestions.alwaysBeCasting.downtime",
      message: `${formatPercentage(actual)}% downtime`
    }))
        .recommended(`<${formatPercentage(recommended)}% is recommended`)
        .regular(recommended + 0.05).major(recommended + 0.15));
  }
}

export default AlwaysBeCasting;
