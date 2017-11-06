import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class VirulentPlagueUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const vpUptime = this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
    when(vpUptime).isLessThan(0.92)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your <SpellLink id ={SPELLS.VIRULENT_PLAGUE.id}/> uptime can be improved. Try to pay attention to when Virulent Plague is about to fall off the priority target, using <SpellLink id ={SPELLS.OUTBREAK.id}/> to refresh Virulent Plague. Using a debuff tracker can help.</span>)
            .icon(SPELLS.VIRULENT_PLAGUE.icon)
            .actual(`${formatPercentage(actual)}% Virulent Plague uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.08).major(recommended - 0.18);
        });
  }

  statistic() {
    const vpUptime = this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIRULENT_PLAGUE.id} />}
        value={`${formatPercentage(vpUptime)} %`}
        label="Virulent Plague Uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default VirulentPlagueUptime;
