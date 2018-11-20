import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBox from 'interface/others/StatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class RuptureUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get percentUptime() {
    return this.enemies.getBuffUptime(SPELLS.RUPTURE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your <SpellLink id={SPELLS.RUPTURE.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.RUPTURE.id} /> on the boss.</>)
        .icon(SPELLS.RUPTURE.icon)
        .actual(`${formatPercentage(actual)}% Rupture uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(10)}
        icon={<SpellIcon id={SPELLS.RUPTURE.id} />}
        value={`${formatPercentage(this.percentUptime)} %`}
        label="Rupture uptime"
      />
    );
  }

}

export default RuptureUptime;
