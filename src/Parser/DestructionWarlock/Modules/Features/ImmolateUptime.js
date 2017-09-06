import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class ImmolateUptime extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const immolateUptime = this.enemies.getBuffUptime(SPELLS.IMMOLATE_DEBUFF.id) / this.owner.fightDuration;
    when(immolateUptime).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Immolate uptime can be improved. Try to pay more attention to it as it provides a significant amount of Soul Shard Fragments over the fight and is also a big portion of your total damage.')
          .icon(SPELLS.IMMOLATE_DEBUFF.icon)
          .actual(`${formatPercentage(actual)}% Immolate uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }

  statistic() {
    const immolateUptime = this.enemies.getBuffUptime(SPELLS.IMMOLATE_DEBUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IMMOLATE_DEBUFF.id} />}
        value={`${formatPercentage(immolateUptime)} %`}
        label='Immolate uptime'
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default ImmolateUptime;
