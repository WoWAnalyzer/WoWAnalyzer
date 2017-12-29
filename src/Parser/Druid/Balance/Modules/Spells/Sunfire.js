import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

class Sunfire extends Analyzer {
  suggestions(when) {
    const sunfireUptimePercentage = this.owner.modules.enemies.getBuffUptime(SPELLS.SUNFIRE.id) / this.owner.fightDuration;

    when(sunfireUptimePercentage).isLessThan(0.98)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your <SpellLink id={SPELLS.SUNFIRE.id} /> uptime can be improved, try to keep it active at all times on priority targets.</span>)
          .icon(SPELLS.SUNFIRE.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.03).major(recommended - 0.08);
      });
  }

  statistic() {
    const sunfireUptimePercentage = this.owner.modules.enemies.getBuffUptime(SPELLS.SUNFIRE.id) / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SUNFIRE.id} />}
        value={`${formatPercentage(sunfireUptimePercentage)}%`}
        label="Sunfire uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default Sunfire;
