import { formatPercentage } from 'common/format';

import CoreAlwaysBeCasting from 'parser/core/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.20)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your downtime can be improved. Try to Always Be Casting (ABC); try to reduce the delay between casting spells and when you\'re not healing try to contribute some damage.')
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }
}

export default AlwaysBeCasting;
