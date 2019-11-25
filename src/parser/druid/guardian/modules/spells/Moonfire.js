import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';

class Moonfire extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const moonfireUptimePercentage = this.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.owner.fightDuration;

    when(moonfireUptimePercentage).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your <SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> uptime was {formatPercentage(moonfireUptimePercentage)}%, unless you have extended periods of downtime it should be near 100%.</span>)
          .icon(SPELLS.MOONFIRE_BEAR.icon)
          .actual(`${formatPercentage(moonfireUptimePercentage)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }

  statistic() {
    const moonfireUptimePercentage = this.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MOONFIRE_BEAR.id} />}
        value={`${formatPercentage(moonfireUptimePercentage)}%`}
        label="Moonfire uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(12);
}

export default Moonfire;
