import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class OssuaryUptime extends Module {
  statistic() {
    const ossuaryUptime = this.owner.modules.combatants.getBuffUptime(SPELLS.OSSUARY.id);
    const ossuaryUptimePercentage = ossuaryUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.OSSUARY.id} />}
        value={`${formatPercentage(ossuaryUptimePercentage)}%`}
        label='Ossuary Uptime'
        tooltip={'Important to maintain. Reduces cost of Death Strike and increases runic power cap by 10.'}
      />


    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default OssuaryUptime;
