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

  get vpUptime() {
    return this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;    
  }

  get vpUptimeSuggestionThresholds() {
    return {
      actual: this.vpUptime,
      isLessThan: {
        minor: 0.92,
        average: 0.84,
        major: .74,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.vpUptimeSuggestionThresholds.actual).isLessThan(this.vpUptimeSuggestionThresholds.minor)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your <SpellLink id ={SPELLS.VIRULENT_PLAGUE.id}/> uptime can be improved. Try to pay attention to when Virulent Plague is about to fall off the priority target, using <SpellLink id ={SPELLS.OUTBREAK.id}/> to refresh Virulent Plague. Using a debuff tracker can help.</span>)
            .icon(SPELLS.VIRULENT_PLAGUE.icon)
            .actual(`${formatPercentage(actual)}% Virulent Plague uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(this.vpUptimeSuggestionThresholds.average).major(this.vpUptimeSuggestionThresholds.major);
        });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VIRULENT_PLAGUE.id} />}
        value={`${formatPercentage(this.vpUptime)} %`}
        label="Virulent Plague Uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default VirulentPlagueUptime;
