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
        value={`${formatPercentage(this.owner.selectedCombatant.masteryPercentage)} % M ${formatPercentage(this.owner.selectedCombatant.hastePercentage)} % H`}
        label="Core Secondary Stats"
        tooltip={`Mastery is ${formatPercentage(this.owner.selectedCombatant.masteryPercentage)} % and Haste is ${formatPercentage(this.owner.selectedCombatant.hastePercentage)} %`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default ShamanStats;
