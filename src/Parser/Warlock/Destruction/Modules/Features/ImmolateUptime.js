import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Wrapper from 'common/Wrapper';

class ImmolateUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.IMMOLATE_DEBUFF.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.9,
        average: 0.85,
        major: 0.75,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>Your <SpellLink id={SPELLS.IMMOLATE_DEBUFF.id} /> uptime can be improved. Try to pay more attention to it as it provides a significant amount of Soul Shard Fragments over the fight and is also a big portion of your total damage.</Wrapper>)
          .icon(SPELLS.IMMOLATE_DEBUFF.icon)
          .actual(`${formatPercentage(actual)}% Immolate uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IMMOLATE_DEBUFF.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Immolate uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default ImmolateUptime;
