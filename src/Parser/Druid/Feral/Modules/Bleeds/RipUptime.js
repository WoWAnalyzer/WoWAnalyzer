import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class RipUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const ripUptime = this.enemies.getBuffUptime(SPELLS.RIP.id) / this.owner.fightDuration;

    when(ripUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.RIP.id} /> uptime can be improved. Try to pay more attention to your bleeds on the Boss</span>)
          .icon(SPELLS.RIP.icon)
          .actual(`${formatPercentage(actual)}% Rip uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  statistic() {
    const ripUptime = this.enemies.getBuffUptime(SPELLS.RIP.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RIP.id} />}
        value={`${formatPercentage(ripUptime)} %`}
        label="Rip uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default RipUptime;
