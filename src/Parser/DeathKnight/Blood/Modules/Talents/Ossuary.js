import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class Ossuary extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id);
  }

  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.OSSUARY.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.uptimeSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Ossuary uptime can be improved. Try to always be above 5 stacks of Bone Shield when you have the talent selected.')
            .icon(SPELLS.OSSUARY.icon)
            .actual(`${formatPercentage(actual)}% Ossuary uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`);
        });
  }

  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.OSSUARY_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Ossuary Uptime"
      />


    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Ossuary;
