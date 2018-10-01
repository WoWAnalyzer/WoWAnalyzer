import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/core/modules/Enemies';

import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

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

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<React.Fragment><SpellLink id={SPELLS.CORRUPTION_CAST.id} /> uptime</React.Fragment>}
        value={`${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default CorruptionUptime;
