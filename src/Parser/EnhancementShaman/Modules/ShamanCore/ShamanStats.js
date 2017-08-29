import React from 'react';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ShamanStats extends Module {
  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="spell_nature_shamanrage" alt="Core Stats" />}
        value={`${formatPercentage(this.owner.selectedCombatant.masteryPercentage, 0)}% M ${formatPercentage(this.owner.selectedCombatant.hastePercentage, 0)}% H`}
        label="Core Secondary Stats"
        tooltip={`Mastery ${formatPercentage(this.owner.selectedCombatant.masteryPercentage)}% and Haste ${formatPercentage(this.owner.selectedCombatant.hastePercentage)}%`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default ShamanStats;
