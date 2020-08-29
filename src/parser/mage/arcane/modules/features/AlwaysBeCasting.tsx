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
          return suggest(<span>Your downtime can be improved. Try to Always Be Casting (ABC), try to reduce the delay between casting spells. If a fight requires movement, try saving <SpellLink id={SPELLS.PRESENCE_OF_MIND.id} /> to make your next 2 <SpellLink id={SPELLS.ARCANE_BLAST.id} /> casts instant.</span>)
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
