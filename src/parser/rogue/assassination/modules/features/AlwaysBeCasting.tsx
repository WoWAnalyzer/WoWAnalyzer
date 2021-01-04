import React from 'react';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { formatPercentage } from 'common/format';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.4,
        average: 0.45,
        major: 0.5,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    const boss = this.owner.boss;

    if(!boss || !boss.fight.disableDeathSuggestion) {
      when(deadTimePercentage).isGreaterThan(this.suggestionThresholds.isGreaterThan.minor)
        .addSuggestion((suggest, actual, recommended) => suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isGreaterThan.average).major(this.suggestionThresholds.isGreaterThan.major));
    }
  }
}

export default AlwaysBeCasting;
