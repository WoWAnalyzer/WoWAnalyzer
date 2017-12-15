import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

class EnrageUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get enrageUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.ENRAGE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.enrageUptime,
      isLessThan: {
        minor: 0.07,
        average: 0.065,
        major: 0.06,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds.actual).isLessThan(this.suggestionThresholds.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.ENRAGE.id} /> uptime can be improved.</Wrapper>)
          .icon(SPELLS.ENRAGE.icon)
          .actual(`${formatPercentage(actual)}% Enrage uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isLessThan.average).major(this.suggestionThresholds.isLessThan.major);
      });
  }

  statistic() {
    const enrageUptime = this.enrageUptime;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ENRAGE.id} />}
        value={`${formatPercentage(enrageUptime)} %`}
        label="Enrage uptime"
      />
    );
  }
}

export default EnrageUptime;