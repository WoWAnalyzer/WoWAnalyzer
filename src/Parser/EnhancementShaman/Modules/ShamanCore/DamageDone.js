import React from 'react';
import Icon from 'common/Icon';
import { formatNumber, formatPercentage } from 'common/format';

import CoreDamageDone from 'Parser/Core/Modules/DamageDone';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DamageDone extends CoreDamageDone {
  suggestions(when) {
    const nonDpsTimePercentage = this.owner.modules.alwaysBeCasting.totalTimeWasted / this.owner.fightDuration;
    when(nonDpsTimePercentage).isGreaterThan(0.3)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Your non DPS time can be improved. Try to cast damaging spells more regularly`)
          .icon("petbattle_health")
          .actual(`${Math.round(actual * 100)}% non DPS time`)
          .recommended(`<${(formatPercentage(recommended))}% is recommended`)
          .regular(recommended).major(recommended + 0.15);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="class_shaman" alt="DPS stats" />}
        value={`${formatNumber(this.total.effective / this.owner.fightDuration * 1000)} DPS`}
        label="Damage Done"
        tooltip={`The total damage done recorded was ${formatNumber(this.total.effective)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(0);
}

export default DamageDone;
