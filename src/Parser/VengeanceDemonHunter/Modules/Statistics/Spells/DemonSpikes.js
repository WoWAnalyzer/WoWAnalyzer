import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DemonSpikes extends Module {

  statistic() {

    const demonSpikesUptime = this.owner.modules.combatants.getBuffUptime(SPELLS.DEMON_SPIKES_BUFF.id);

    const demonSpikesUptimePercentage = demonSpikesUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="ability_demonhunter_demonspikes" alt="Demon Spikes" />}
        value={`${formatPercentage(demonSpikesUptimePercentage)}%`}
        label='Demon Spikes Uptime'
        tooltip={`The Demon Spikes total uptime was ${formatDuration(demonSpikesUptime / 1000)} seconds.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default DemonSpikes;
