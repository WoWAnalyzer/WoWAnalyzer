import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Momentum extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.combatants.selected.hasTalent(SPELLS.MOMENTUM_TALENT.id);
    }
  }

  statistic() {

    const momentumUptime = this.combatants.selected.getBuffUptime(SPELLS.MOMENTUM_TALENT.id);

    const momentumUptimePercentage = momentumUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="ability_foundryraid_demolition" alt="Momentum" />}
        value={`${formatPercentage(momentumUptimePercentage)}%`}
        label='Momentum Uptime'
        tooltip={`The Momentum buff total uptime was ${formatDuration(momentumUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Momentum;
