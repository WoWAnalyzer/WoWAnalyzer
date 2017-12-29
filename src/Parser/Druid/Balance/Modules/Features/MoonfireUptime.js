import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

class MoonfireUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  get suggestionThresholds() {
    const moonfireUptime = this.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.owner.fightDuration;
    return {
      actual: moonfireUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
      text: 'Your Moonfire uptime can be improved. Try to pay more attention to your Moonfire on the boss.',
    };
  }

  suggestions(when) {
    const suggestion = this.suggestionThresholds;
    when(suggestion)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(suggestion.text)
          .icon(SPELLS.MOONFIRE_BEAR.icon)
          .actual(`${formatPercentage(actual)}% Moonfire uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const moonfireUptime = this.enemies.getBuffUptime(SPELLS.MOONFIRE_BEAR.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MOONFIRE_BEAR.id} />}
        value={`${formatPercentage(moonfireUptime)} %`}
        label="Moonfire uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default MoonfireUptime;