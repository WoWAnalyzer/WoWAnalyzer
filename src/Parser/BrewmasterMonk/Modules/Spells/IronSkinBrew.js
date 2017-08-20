import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Module from 'Parser/Core/Module';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class IronSkinBrew extends Module {

  suggestions(when) {
    const isbUptimePercentage = this.owner.selectedCombatant.getBuffUptime(SPELLS.IRONSKIN_BREW_BUFF.id)/ this.owner.fightDuration;

    when(isbUptimePercentage).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> uptime was {formatPercentage(isbUptimePercentage)}%, unless there are extended periods of downtime it should be over should be near 100%.</span>)
          .icon(SPELLS.IRONSKIN_BREW.icon)
          .actual(`${formatPercentage(isbUptimePercentage)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% or more is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }

  statistic() {
    const isbUptime = this.owner.selectedCombatant.getBuffUptime(SPELLS.IRONSKIN_BREW_BUFF.id)/ this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONSKIN_BREW.id} />}
        value={`${formatPercentage(isbUptime)}%`}
        label='Ironskin Brew uptime'
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default IronSkinBrew;
