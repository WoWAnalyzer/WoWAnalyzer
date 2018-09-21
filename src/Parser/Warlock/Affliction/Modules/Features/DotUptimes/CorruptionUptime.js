import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS/index';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class CorruptionUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.CORRUPTION_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <React.Fragment>
            Your <SpellLink id={SPELLS.CORRUPTION_CAST.id} /> uptime can be improved. Try to pay more attention to your Corruption on the boss, perhaps use some debuff tracker.
          </React.Fragment>
        )
          .icon(SPELLS.CORRUPTION_CAST.icon)
          .actual(`${formatPercentage(actual)}% Corruption uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CORRUPTION_CAST.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Corruption uptime"
      />
    );
  }

  subStatistic() {
    return (
      <div className="flex">
        <div className="flex-main">
          <SpellLink id={SPELLS.CORRUPTION_CAST.id} /> uptime
        </div>
        <div className="flex-sub text-right">
          {formatPercentage(this.uptime)} %
        </div>
      </div>
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default CorruptionUptime;
