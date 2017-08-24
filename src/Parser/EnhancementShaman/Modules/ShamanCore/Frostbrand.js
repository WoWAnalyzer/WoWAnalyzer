import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Frostbrand extends Module {
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTalent(SPELLS.HAILSTORM_TALENT.id);
    }
  }

  suggestions(when) {
    const frostbrandUptime = this.owner.selectedCombatant.getBuffUptime(SPELLS.FROSTBRAND.id) / this.owner.fightDuration;

    this.active &&
    when(frostbrandUptime).isLessThan(.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Try to make sure the Frostbrand is always up, when it drops you should refresh it as soon as possible`)
          .icon(SPELLS.FROSTBRAND.icon)
          .actual(`${formatPercentage(frostbrandUptime)}% uptime`)
          .recommended(`${(formatPercentage(recommended))}% is recommended`)
          .regular(recommended).major(recommended - 0.5);
      });
  }

  statistic() {
    const frostbrandUptime = this.owner.selectedCombatant.getBuffUptime(SPELLS.FROSTBRAND.id) / this.owner.fightDuration;
    return (
      this.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.FROSTBRAND.id} />}
        value={`${formatPercentage(frostbrandUptime)} %`}
        label="Frostbrand Uptime"
        tooltip={`One of your highest priorities, get as close to 100% as possible`}
      />)
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Frostbrand;
