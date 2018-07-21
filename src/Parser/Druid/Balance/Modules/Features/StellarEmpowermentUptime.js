import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class StellarEmpowermentUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  statistic() {
    const stellarEmpowermentUptime = this.enemies.getBuffUptime(SPELLS.STELLAR_EMPOWERMENT.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.STELLAR_EMPOWERMENT.id} />}
        value={`${formatPercentage(stellarEmpowermentUptime)} %`}
        label="Stellar Empowerment uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default StellarEmpowermentUptime;
