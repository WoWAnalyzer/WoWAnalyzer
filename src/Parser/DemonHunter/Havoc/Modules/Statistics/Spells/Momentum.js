import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Momentum extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.MOMENTUM_TALENT.id);
  }

  statistic() {
    const momentumUptime = this.combatants.selected.getBuffUptime(SPELLS.MOMENTUM_TALENT.id);

    const momentumUptimePercentage = momentumUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MOMENTUM_TALENT.id} />}
        value={`${formatPercentage(momentumUptimePercentage)}%`}
        label="Momentum Uptime"
        tooltip={`The Momentum buff total uptime was ${formatDuration(momentumUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Momentum;
