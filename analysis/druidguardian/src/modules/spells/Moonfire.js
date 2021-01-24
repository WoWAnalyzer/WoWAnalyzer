import React from 'react';
import { formatPercentage } from 'common/format';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import StatisticBox, { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import { t } from '@lingui/macro';

class Moonfire extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  statisticOrder = STATISTIC_ORDER.CORE(12);

  suggestions(when) {
    const moonfireUptimePercentage = this.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.owner.fightDuration;

    when(moonfireUptimePercentage).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => suggest(<span> Your <SpellLink id={SPELLS.MOONFIRE_BEAR.id} /> uptime was {formatPercentage(moonfireUptimePercentage)}%, unless you have extended periods of downtime it should be near 100%.</span>)
        .icon(SPELLS.MOONFIRE_BEAR.icon)
        .actual(t({
      id: "druid.guardian.suggestions.moonfire.uptime",
      message: `${formatPercentage(moonfireUptimePercentage)}% uptime`
    }))
        .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
        .regular(recommended - 0.05).major(recommended - 0.15));
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
}

export default Moonfire;
