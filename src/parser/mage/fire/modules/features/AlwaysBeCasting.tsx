import React from 'react';

import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SpellLink from 'common/SpellLink';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
  suggestions(when: any) {
    const deadTimePercentage = this.totalTimeWasted / this.owner.fightDuration;
    const boss = this.owner.boss;

    if (!boss || !boss.fight.disableDowntimeSuggestion) {
      when(deadTimePercentage).isGreaterThan(0.2)
        .addSuggestion((suggest: any, actual: any, recommended: any) => {
          return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. If you have to move, try casting <SpellLink id={SPELLS.SCORCH.id} />.</span>)
            .icon('spell_mage_altertime')
            .actual(`${formatPercentage(actual)}% downtime`)
            .recommended(`<${formatPercentage(recommended)}% is recommended`)
            .regular(recommended + 0.15).major(recommended + 0.2);
        });
    }
  }

  statisticOrder: any = STATISTIC_ORDER.CORE(1);
}

export default AlwaysBeCasting;
