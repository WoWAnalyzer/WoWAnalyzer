import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import StatisticBox from 'interface/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/STATISTIC_ORDER';

class EnvenomUptime extends Analyzer {

  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.ENVENOM.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(12)}
        icon={<SpellIcon id={SPELLS.ENVENOM.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Envenom uptime"
      />
    );
  }

}

export default EnvenomUptime;
