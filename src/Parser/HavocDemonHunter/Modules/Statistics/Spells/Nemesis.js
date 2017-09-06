import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Nemesis extends Module {

  statistic() {

    const nemesisUptime = this.owner.modules.enemies.getBuffUptime(SPELLS.NEMESIS_TALENT.id);
    const nemesisUptimePercentage = nemesisUptime / this.owner.fightDuration;

    if(nemesisUptime > 0)
    {
    return (
      <StatisticBox
        icon={<Icon icon="ability_warlock_improveddemonictactics" alt="Nemesis" />}
        value={`${formatPercentage(nemesisUptimePercentage)}%`}
        label='Nemesis Uptime'
        tooltip={`The Nemesis buff total uptime was ${formatDuration(nemesisUptime / 1000)} seconds.`}
      />
    );
    }
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Nemesis;
