import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';
import { When } from 'parser/core/ParseResults';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import { Trans } from '@lingui/macro';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  suggestions(when: When) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(deadTimePercentage).isGreaterThan(0.2)
        .addSuggestion((suggest, actual, recommended) => suggest(<Trans id="shared.suggestions.alwaysBeCasting.suggestion">Your downtime can be improved. Try to Always Be Casting (ABC), avoid delays between casting spells and cast instant spells when you have to move.</Trans>)
          .icon('spell_mage_altertime')
          .actual(<Trans id="shared.suggestions.alwaysBeCasting.downtime">{formatPercentage(actual)}% downtime</Trans>)
          .recommended(`<${formatPercentage(recommended)}% is recommended`)
          .regular(recommended + 0.15).major(recommended + 0.2));
    }
  }

  statisticOrder: any = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;

