import React from 'react';
import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class VirulentPlagueUptime extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const vpUptime = this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
    when(vpUptime).isLessThan(0.95)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Virulent Plague uptime can be improved. Try to pay attention to when Virulent Plague is about to fall off the priority target, perhaps use some debuff tracker.')
            .icon(SPELLS.VIRULENT_PLAGUE.icon)
            .actual(`${formatPercentage(actual)}% Virulent Plague uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
  }

  statistic() {
    const vpUptime = this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIRULENT_PLAGUE.id} />}
        value={`${formatPercentage(vpUptime)} %`}
        label="Virulent Plague uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default VirulentPlagueUptime;
