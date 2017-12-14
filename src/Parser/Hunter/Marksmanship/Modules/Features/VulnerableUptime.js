import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class VulnerableUpTime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const vulnerableuptime = this.enemies.getBuffUptime(SPELLS.VULNERABLE.id) / this.owner.fightDuration;

    when(vulnerableuptime).isLessThan(0.80)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.VULNERABLE.id} /> uptime can be improved. Make sure you use Windburst or Marked Shot to open the Vulnerable Window to maximize damage with your Aimed Shots</span>)
          .icon(SPELLS.VULNERABLE.icon)
          .actual(`${formatPercentage(actual)}% Vulnerable uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  statistic() {
    const vulnerableUptime = this.enemies.getBuffUptime(SPELLS.VULNERABLE.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VULNERABLE.id} />}
        value={`${formatPercentage(vulnerableUptime)} %`}
        label="Vulnerable uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default VulnerableUpTime;
