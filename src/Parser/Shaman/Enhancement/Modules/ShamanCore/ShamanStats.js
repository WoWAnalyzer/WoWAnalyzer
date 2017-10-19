import React from 'react';
import Icon from 'common/Icon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ShamanStats extends Module {
  static dependencies = {
    combatants: Combatants,
  }

  statistic() {
    return (
      <StatisticBox
        icon={<Icon icon="spell_nature_shamanrage" alt="Core Stats" />}
        value={`${formatPercentage(this.combatants.selected.masteryPercentage, 0)}% M ${formatPercentage(this.combatants.selected.hastePercentage, 0)}% H`}
        label="Core Secondary Stats"
        tooltip={`Mastery ${formatPercentage(this.combatants.selected.masteryPercentage)}% and Haste ${formatPercentage(this.combatants.selected.hastePercentage)}%`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default ShamanStats;
