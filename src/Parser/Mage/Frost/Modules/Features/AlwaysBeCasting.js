import React from 'react';

import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {

get deadTimePercentage() {
  return this.totalTimeWasted / this.owner.fightDuration;
}

  get downtimeSuggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.05,
        average: 0.15,
        major: 0.25,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const boss = this.owner.boss;
    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.downtimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. Even if you have to move, try casting instants, even unbuffed <SpellLink id={SPELLS.ICE_LANCE.id} /> spam is better than nothing.</span>)
            .icon('spell_mage_altertime')
            .actual(`${formatPercentage(actual)}% downtime`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`);
        });
    }
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
