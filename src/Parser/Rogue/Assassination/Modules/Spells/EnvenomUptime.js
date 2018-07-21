import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

class EnvenomUptime extends Analyzer {

  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ENVENOM.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ENVENOM.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Envenom Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(120);

}

export default EnvenomUptime;
