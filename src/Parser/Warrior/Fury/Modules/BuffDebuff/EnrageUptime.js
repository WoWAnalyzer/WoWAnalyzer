import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class EnrageUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get enrageUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.ENRAGE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      isLessThan: {
        minor: 0.7,
        average: 0.65,
        major: 0.6,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const {
        isLessThan: {
          minor,
          average,
          major,
        },
      } = this.suggestionThresholds;

    when(this.enrageUptime).isLessThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.ENRAGE.id} /> uptime can be improved.</React.Fragment>)
          .icon(SPELLS.ENRAGE.icon)
          .actual(`${formatPercentage(actual)}% Enrage uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ENRAGE.id} />}
        value={`${formatPercentage(this.enrageUptime)} %`}
        label="Enrage uptime"
      />
    );
  }
}

export default EnrageUptime;
