import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';

class Moonfire extends Analyzer {
  suggestions(when) {
    const moonfireUptimePercentage = this.owner.modules.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.owner.fightDuration;

    when(moonfireUptimePercentage).isLessThan(0.98)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your <SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> uptime can be improved, try to keep it active at all times on priority targets. Moonfire is usually not woth casting on targets that'll last 8s or less.</span>)
          .icon(SPELLS.MOONFIRE_BEAR.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.03).major(recommended - 0.08);
      });
  }

  statistic() {
    const moonfireUptimePercentage = this.owner.modules.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MOONFIRE_BEAR.id} />}
        value={`${formatPercentage(moonfireUptimePercentage)}%`}
        label="Moonfire uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Moonfire;
