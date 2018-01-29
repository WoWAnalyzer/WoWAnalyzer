import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import Combatants from 'Parser/Core/Modules/Combatants';

import Analyzer from 'Parser/Core/Analyzer';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Flametongue extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  suggestions(when) {
    const flametongueUptime = this.combatants.selected.getBuffUptime(SPELLS.FLAMETONGUE_BUFF.id) / this.owner.fightDuration;
    when(flametongueUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(`Your Flametongue uptime of ${formatPercentage(flametongueUptime)}% is below 95%, try to get as close to 100% as possible`)
          .icon(SPELLS.FLAMETONGUE_BUFF.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${(formatPercentage(recommended))}% is recommended`)
          .regular(recommended).major(recommended - 0.05);
      });
  }

  statistic() {
    const flametongueUptime = this.combatants.selected.getBuffUptime(SPELLS.FLAMETONGUE_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FLAMETONGUE_BUFF.id} />}
        value={`${formatPercentage(flametongueUptime)} %`}
        label="Flametongue Uptime"
        tooltip="One of your highest priorities, get as close to 100% as possible"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Flametongue;
