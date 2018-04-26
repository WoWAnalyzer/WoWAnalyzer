import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import CoreAlwaysBeCasting from 'Parser/Core/Modules/AlwaysBeCasting';
import { STATISTIC_ORDER } from 'Main/StatisticBox';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  get suggestionThresholds() {
    return {
      actual: this.downtimePercentage,
      isGreaterThan: {
        minor: 0.2,
        average: 0.35,
        major: 0.4,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your downtime can be improved. Try to cast more, for example by reducing the delay between casting spells. Even if you have to move, try to cast something instant with range like <SpellLink id={SPELLS.JUDGMENT_CAST.id} icon/> or <SpellLink id={SPELLS.AVENGERS_SHIELD.id} icon/>.</React.Fragment>)
          .icon('spell_mage_altertime')
          .actual(`${formatPercentage(actual)}% downtime`)
          .recommended(`<${formatPercentage(recommended)}% is recommended`);
      });
    }
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
