import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get deadTimePercentage() {
    return this.totalTimeWasted / this.owner.fightDuration;
  }

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.10,
        average: 0.15,
        major: 0.20,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {

    when(this.downtimeSuggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC). It's better to cast low-priority abilities such as <SpellLink id={SPELLS.WHIRLWIND_FURY.id} /> than it is to do nothing./>.</span>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2);
      });
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
