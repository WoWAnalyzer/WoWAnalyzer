import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import StatisticBox from 'interface/others/StatisticBox';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class GarroteUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get percentUptime() {
    return this.enemies.getBuffUptime(SPELLS.GARROTE.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.percentUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>Your <SpellLink id={SPELLS.GARROTE.id} /> uptime can be improved. Try to pay more attention to your <SpellLink id={SPELLS.GARROTE.id} /> on the boss.</>)
        .icon(SPELLS.GARROTE.icon)
        .actual(`${formatPercentage(actual)}% Garrote uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GARROTE.id} />}
        value={`${formatPercentage(this.percentUptime)} %`}
        label="Garrote uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(110);

}

export default GarroteUptime;
