import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

class FrothingBerserkerUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id);
  }
  
  get frothingBerserkerUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.FROTHING_BERSERKER.id) / this.owner.fightDuration;
  }
  
  get suggestionThresholds() {
    return {
      actual: this.frothingBerserkerUptime,
      isLessThan: {
        minor: 0.065,
        average: 0.06,
        major: 0.055,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds.actual).isLessThan(this.suggestionThresholds.isLessThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.FROTHING_BERSERKER.id} /> uptime can be improved.</Wrapper>)
          .icon(SPELLS.FROTHING_BERSERKER.icon)
          .actual(`${formatPercentage(actual)}% Frothing Berserker uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(this.suggestionThresholds.isLessThan.average).major(this.suggestionThresholds.isLessThan.major);
      });
  }

  statistic() {
    const uptime = this.frothingBerserkerUptime;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FROTHING_BERSERKER.id} />}
        value={`${formatPercentage(uptime)} %`}
        label="Frothing Berserker uptime"
      />
    );
  }
}

export default FrothingBerserkerUptime;