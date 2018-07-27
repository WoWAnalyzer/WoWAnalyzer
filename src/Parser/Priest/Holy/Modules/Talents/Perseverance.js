import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage } from 'common/format';

class Perseverance extends Analyzer {

  totalHealing = 0;
  overhealing = 0;
  absorbed = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PERSEVERANCE_TALENT.id);
  }

  get uptime() {
    return this.player.getBuffUptime(SPELLS.PERSEVERANCE_TALENT.id) / this.owner.fightDuration;
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
        return suggest('Your Perseverance uptime can be improved.')
          .icon(SPELLS.PERSEVERANCE_TALENT.icon)
          .actual(`${formatPercentage(actual)}% Perseverance uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PERSEVERANCE_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Perseverance uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Perseverance;
