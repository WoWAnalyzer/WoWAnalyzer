import React from 'react';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SuggestionThresholds from '../../SuggestionThresholds';

class Lifebloom extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  get uptime() {
    return Object.keys(this.combatants.players)
      .map(key => this.combatants.players[key])
      .reduce((uptime, player) =>
        uptime + player.getBuffUptime(SPELLS.LIFEBLOOM_HOT_HEAL.id),0);
  }

  suggestions(when) {
    const uptimePercent = this.uptime / this.owner.fightDuration;

    when(uptimePercent).isLessThan(SuggestionThresholds.LIFEBLOOM_UPTIME.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.LIFEBLOOM_HOT_HEAL.id} /> uptime can be improved.</span>)
          .icon(SPELLS.LIFEBLOOM_HOT_HEAL.icon)
          .actual(`${formatPercentage(uptimePercent)}% uptime`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.LIFEBLOOM_UPTIME.regular).major(SuggestionThresholds.LIFEBLOOM_UPTIME.major);
      });
  }

  statistic() {
    const uptimePercent = this.uptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.LIFEBLOOM_HOT_HEAL.id} />}
        value={`${formatPercentage(uptimePercent)} %`}
        label="Lifebloom Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);

}

export default Lifebloom;
