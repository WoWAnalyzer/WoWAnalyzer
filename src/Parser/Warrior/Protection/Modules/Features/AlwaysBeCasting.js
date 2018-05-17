import React from 'react';
import { formatPercentage } from 'common/format';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
    suggestions(when) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;

    when(deadTimePercentage).isGreaterThan(0.2)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your downtime can be improved. Try to Always Be Casting (ABC)..</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended + 0.05).major(recommended + 0.15);
      });
  }
}

export default AlwaysBeCasting;
