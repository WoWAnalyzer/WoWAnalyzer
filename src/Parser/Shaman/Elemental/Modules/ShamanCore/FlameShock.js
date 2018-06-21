import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class FlameShock extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.FLAME_SHOCK.id) / this.owner.fightDuration;
  }

  suggestions(when) {

    when(this.uptime).isLessThan(0.99)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.FLAME_SHOCK.id} /> uptime can be improved.</span>)
          .icon(SPELLS.FLAME_SHOCK.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLAME_SHOCK.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Uptime"
        tooltip={
          `Flameshock Uptime`
        }
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default FlameShock;
