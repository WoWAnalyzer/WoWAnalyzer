import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Wrapper from 'common/Wrapper';

class VulnerableUpTime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptimeThreshold() {
    return {
      actual: this.uptimePercentage,
      isLessThan: {
        minor: 0.8,
        average: 0.75,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.VULNERABLE.id) / this.owner.fightDuration;
  }
  suggestions(when) {
    when(this.uptimeThreshold).addSuggestion((suggest, actual, recommended) => {
      return suggest(<Wrapper>Your <SpellLink id={SPELLS.VULNERABLE.id} icon /> uptime can be improved. Make sure you use Windburst or Marked Shot to open the Vulnerable Window to maximize damage with your Aimed Shots</Wrapper>)
        .icon(SPELLS.VULNERABLE.icon)
        .actual(`${formatPercentage(actual)}% Vulnerable uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VULNERABLE.id} />}
        value={`${formatPercentage(this.uptimePercentage)} %`}
        label="Vulnerable uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(6);
}

export default VulnerableUpTime;
