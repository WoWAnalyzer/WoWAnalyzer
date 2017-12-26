import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';

class AgonyUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    combatants: Combatants,
  };

  get suggestionThresholds() {
    const agonyUptime = this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
    if (this.combatants.selected.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id)) {
      return {
        actual: agonyUptime,
        isLessThan: {
          minor: 0.95,
          average: 0.9,
          major: 0.8,
        },
        style: 'percentage',
        text: <Wrapper>Your Agony uptime can be improved. Try to pay more attention to your Agony on the boss, especially since you're using <SpellLink id={SPELLS.WRITHE_IN_AGONY_TALENT.id} /> talent.</Wrapper>,
      };
    } else {
      return {
        actual: agonyUptime,
        isLessThan: {
          minor: 0.85,
          average: 0.8,
          major: 0.7,
        },
        style: 'percentage',
        text: 'Your Agony uptime can be improved. Try to pay more attention to your Agony on the boss, perhaps use some debuff tracker.',
      };
    }
  }

  suggestions(when) {
    const suggestion = this.suggestionThresholds;
    when(suggestion)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(suggestion.text)
          .icon(SPELLS.AGONY.icon)
          .actual(`${formatPercentage(actual)}% Agony uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`);
      });
  }

  statistic() {
    const agonyUptime = this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AGONY.id} />}
        value={`${formatPercentage(agonyUptime)} %`}
        label="Agony uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default AgonyUptime;
