import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Landslide extends Module {
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.LANDSLIDE_TALENT.id);
    }
  }

  suggestions(when) {
    const landslideUptime = this.owner.selectedCombatant.getBuffUptime(SPELLS.LANDSLIDE_BUFF.id) / this.owner.fightDuration;

    this.active &&
    when(landslideUptime).isLessThan(.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Try to make sure the Landslide buff from Rockbiter is always up, when it drops you should refresh it as soon as possible`)
          .icon(SPELLS.LANDSLIDE_BUFF.icon)
          .actual(`${formatPercentage(landslideUptime)}% uptime`)
          .recommended(`${(formatPercentage(recommended))}% is recommended`)
          .regular(recommended).major(recommended - 0.5);
      });
  }

  statistic() {
    const landslideUptime = this.owner.selectedCombatant.getBuffUptime(SPELLS.LANDSLIDE_BUFF.id) / this.owner.fightDuration;
    return (
      this.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.LANDSLIDE_BUFF.id} />}
        value={`${formatPercentage(landslideUptime)} %`}
        label="Landslide Uptime"
        tooltip={`One of your highest priorities, get as close to 100% as possible`}
      />)
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default Landslide;
