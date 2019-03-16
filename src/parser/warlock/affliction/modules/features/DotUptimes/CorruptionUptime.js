import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import Statistic from 'interface/statistics/Statistic';
import SpellIcon from 'common/SpellIcon';
import BoringSpellValue from 'interface/statistics/components/BoringSpellValue';
import UptimeBar from 'interface/statistics/components/UptimeBar';
import StatisticBar from 'interface/statistics/StatisticBar';

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
          <>
            Your <SpellLink id={SPELLS.CORRUPTION_CAST.id} /> uptime can be improved. Try to pay more attention to your Corruption on the boss, perhaps use some debuff tracker.
          </>
        )
          .icon(SPELLS.CORRUPTION_CAST.icon)
          .actual(`${formatPercentage(actual)}% Corruption uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  subStatistic() {
    /*
        <div className="pad">
          <label><SpellIcon id={SPELLS.CORRUPTION_DEBUFF.id} /> Corruption uptime</label>
          <div className="value">
            {formatPercentage(this.uptime)} %
          </div>
        </div>
        */
    const history = this.enemies.getDebuffHistory(SPELLS.CORRUPTION_DEBUFF.id);
    return (
      <div className="flex">
        <div className="flex-sub icon">
          <SpellIcon id={SPELLS.CORRUPTION_CAST.id} />
        </div>
        <div
          className="flex-sub value"
          style={{ width: 140 }}
        >
          {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </div>
        <div className="flex-main chart" style={{ padding: 15 }}>
          <UptimeBar
            uptimeHistory={history}
            start={this.owner.fight.start_time}
            end={this.owner.fight.end_time}
            style={{ height: '100%' }}
          />
        </div>
      </div>
    );
  }
}

export default CorruptionUptime;
