import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class Momentum extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MOMENTUM_TALENT.id);
  }

  statistic() {
    const momentumUptime = this.selectedCombatant.getBuffUptime(SPELLS.MOMENTUM_TALENT.id);

    const momentumUptimePercentage = momentumUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(3)}
        icon={<SpellIcon id={SPELLS.MOMENTUM_TALENT.id} />}
        value={`${formatPercentage(momentumUptimePercentage)}%`}
        label="Momentum Uptime"
        tooltip={`The Momentum buff total uptime was ${formatDuration(momentumUptime / 1000)}.`}
      />
    );
  }
}

export default Momentum;
