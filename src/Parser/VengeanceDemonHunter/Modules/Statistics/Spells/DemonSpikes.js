import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DemonSpikes extends Module {
  static dependencies = {
  combatants: Combatants,
  };

  statistic() {

    const demonSpikesUptime = this.combatants.selected.getBuffUptime(SPELLS.DEMON_SPIKES_BUFF.id);

    const demonSpikesUptimePercentage = demonSpikesUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DEMON_SPIKES.id} />}
        value={`${formatPercentage(demonSpikesUptimePercentage)}%`}
        label='Demon Spikes Uptime'
        tooltip={`The Demon Spikes total uptime was ${formatDuration(demonSpikesUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default DemonSpikes;
