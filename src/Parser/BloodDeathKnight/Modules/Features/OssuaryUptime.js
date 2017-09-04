import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class OssuaryUptime extends Module {

  statistic() {

    const ossuaryUptime = this.owner.modules.combatants.getBuffUptime(SPELLS.Ossuary.id);
    const ossuaryUptimePercentage = ossuaryUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="ability_deathknight_brittlebones" />}
        value={`${formatPercentage(ossuaryUptimePercentage)}%`}
        label='Ossuary Uptime'
        tooltip={`Ossuary total uptime was ${formatDuration(ossuaryUptime / 1000)} seconds.`}
      />


    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default OssuaryUptime;
