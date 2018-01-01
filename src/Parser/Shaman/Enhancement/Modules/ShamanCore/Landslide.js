import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Landslide extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.LANDSLIDE_TALENT.id);
  }

  suggestions(when) {
    const landslideUptime = this.combatants.selected.getBuffUptime(SPELLS.LANDSLIDE_BUFF.id) / this.owner.fightDuration;

    when(landslideUptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('Try to make sure the Landslide buff from Rockbiter is always up, when it drops you should refresh it as soon as possible')
          .icon(SPELLS.LANDSLIDE_BUFF.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${(formatPercentage(recommended, 0))}% is recommended`)
          .regular(recommended).major(recommended - 0.05);
      });
  }

  statistic() {
    const landslideUptime = this.combatants.selected.getBuffUptime(SPELLS.LANDSLIDE_BUFF.id) / this.owner.fightDuration;
    return (
      (<StatisticBox
        icon={<SpellIcon id={SPELLS.LANDSLIDE_BUFF.id} />}
        value={`${formatPercentage(landslideUptime)} %`}
        label="Landslide Uptime"
        tooltip="One of your highest priorities, get as close to 100% as possible"
      />)
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default Landslide;
