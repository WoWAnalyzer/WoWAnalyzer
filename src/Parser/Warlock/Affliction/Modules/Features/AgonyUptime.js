import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class AgonyUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
  }

  get defaultSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.85,
        average: 0.8,
        major: 0.7,
      },
      style: 'percentage',
    };
  }

  get writheSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    if (this.combatants.selected.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id)) {
      when(this.writheSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved. Try to pay more attention to your Agony on the boss, especially since you're using <SpellLink id={SPELLS.WRITHE_IN_AGONY_TALENT.id} /> talent.</Wrapper>)
            .icon(SPELLS.AGONY.icon)
            .actual(`${formatPercentage(actual)}% Agony uptime`)
            .recommended(`> ${formatPercentage(recommended)}% is recommended`);
        });
    } else {
      when(this.defaultSuggestionThresholds)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<Wrapper>Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved. Try to pay more attention to your Agony on the boss, perhaps use some debuff tracker.</Wrapper>)
            .icon(SPELLS.AGONY.icon)
            .actual(`${formatPercentage(actual)}% Agony uptime`)
            .recommended(`> ${formatPercentage(recommended)}% is recommended`);
        });
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AGONY.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Agony uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default AgonyUptime;
