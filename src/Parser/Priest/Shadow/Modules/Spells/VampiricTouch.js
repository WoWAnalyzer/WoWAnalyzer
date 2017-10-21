import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class VampiricTouch extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const vampiricTouchUptime = this.enemies.getBuffUptime(SPELLS.VAMPIRIC_TOUCH.id) / this.owner.fightDuration;
    when(vampiricTouchUptime).isLessThan(0.85)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.VAMPIRIC_TOUCH.id} /> on the boss.</span>)
          .icon(SPELLS.VAMPIRIC_TOUCH.icon)
          .actual(`${formatPercentage(actual)}% Vampiric Touch uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.15);
      });
  }

  statistic() {
    const vampiricTouchUptime = this.enemies.getBuffUptime(SPELLS.VAMPIRIC_TOUCH.id) / this.owner.fightDuration;
    return (<StatisticBox
      icon={<SpellIcon id={SPELLS.VAMPIRIC_TOUCH.id} />}
      value={`${formatPercentage(vampiricTouchUptime)} %`}
      label="Vampiric Touch uptime"
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default VampiricTouch;
