import React from 'react';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SuggestionThresholds from '../../SuggestionThresholds';

class PurgeTheWicked extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.PURGE_THE_WICKED_BUFF.id) / this.owner.fightDuration;
  }

  suggestions(when) {
    const uptime = this.uptime || 0;

    when(uptime).isLessThan(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.PURGE_THE_WICKED_BUFF.id} /> uptime can be improved.</span>)
          .icon(SPELLS.PURGE_THE_WICKED_BUFF.icon)
          .actual(`${formatPercentage(uptime)}% uptime`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.regular).major(SuggestionThresholds.PURGE_THE_WICKED_UPTIME.major);
      });
  }

  statistic() {
    const uptime = this.uptime || 0;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PURGE_THE_WICKED_BUFF.id} />}
        value={`${formatPercentage(uptime)} %`}
        label="Purge the Wicked Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);

}

export default PurgeTheWicked;
