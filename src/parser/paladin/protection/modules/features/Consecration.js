import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

class Consecration extends Analyzer {
  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.CONSECRATION_BUFF.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Consecration uptime can be improved. Maintain it to reduce all incoming damage by a flat amount and refresh it during rotational downtime.')
            .icon(SPELLS.CONSECRATION_CAST.icon)
            .actual(`${formatPercentage(actual)}% Consecration uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.CONSECRATION_CAST.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Consecration uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default Consecration;
