import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';

class FrothingBerserkerUptime extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id);
  }
  
  get frothingBerserkerUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.FROTHING_BERSERKER.id) / this.owner.fightDuration;
  }
  
  get suggestionThresholds() {
    return {
      isLessThan: {
        minor: 0.65,
        average: 0.6,
        major: 0.55,
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

    when(this.frothingBerserkerUptime).isLessThan(minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<React.Fragment>Your <SpellLink id={SPELLS.FROTHING_BERSERKER.id} /> uptime can be improved.</React.Fragment>)
          .icon(SPELLS.FROTHING_BERSERKER.icon)
          .actual(`${formatPercentage(actual)}% Frothing Berserker uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(average).major(major);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FROTHING_BERSERKER.id} />}
        value={`${formatPercentage(this.frothingBerserkerUptime)} %`}
        label="Frothing Berserker uptime"
      />
    );
  }
}

export default FrothingBerserkerUptime;
