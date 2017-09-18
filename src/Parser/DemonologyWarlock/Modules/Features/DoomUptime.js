import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class DoomUptime extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const doomUptime = this.enemies.getBuffUptime(SPELLS.DOOM.id) / this.owner.fightDuration;
    when(doomUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Your Doom uptime can be improved. Try to pay more attention to your Doom on the boss, as it is one of your Soul Shard generators.')
          .icon(SPELLS.DOOM.icon)
          .actual(`${formatPercentage(actual)}% Doom uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }

  statistic() {
    const doomUptime = this.enemies.getBuffUptime(SPELLS.DOOM.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.DOOM.id} />}
        value={`${formatPercentage(doomUptime)} %`}
        label="Doom uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(4);
}

export default DoomUptime;
