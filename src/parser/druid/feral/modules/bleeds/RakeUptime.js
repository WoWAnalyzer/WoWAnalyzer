import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class RakeUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.90,
        major: 0.80,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(
        <React.Fragment>
          Your <SpellLink id={SPELLS.RAKE.id} /> uptime can be improved. Unless the current application was buffed by Prowl you should refresh the DoT once it has reached its <dfn data-tip={`The last 30% of the DoT's duration. When you refresh during this time you don't lose any duration in the process.`}>pandemic window</dfn>, don't wait for it to wear off.
        </React.Fragment>
      )
        .icon(SPELLS.RAKE.icon)
        .actual(`${formatPercentage(actual)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RAKE.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Rake uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default RakeUptime;
