import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class NightbladeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get percentUptime() {
    return this.enemies.getBuffUptime(SPELLS.NIGHTBLADE.id) / this.owner.fightDuration;
  }  

  get thresholds() {
    return {
      actual: this.percentUptime,
      isLessThan: {
        minor: 0.98,
        average: 0.95,
        major: 0.9,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.NIGHTBLADE.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Nightblade Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(100);

}

export default NightbladeUptime;
