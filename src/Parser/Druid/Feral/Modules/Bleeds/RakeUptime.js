import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class RakeUptime extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const rakeUptime = this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id) / this.owner.fightDuration;

    when(rakeUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.RAKE.id} /> uptime can be improved. Try to pay more attention to your bleeds on the Boss</span>)
          .icon(SPELLS.RAKE_BLEED.icon)
          .actual(`${formatPercentage(actual)}% Rake uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  statistic() {
    const rakeUptime = this.enemies.getBuffUptime(SPELLS.RAKE_BLEED.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.RAKE_BLEED.id} />}
        value={`${formatPercentage(rakeUptime)} %`}
        label="Rake uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default RakeUptime;
