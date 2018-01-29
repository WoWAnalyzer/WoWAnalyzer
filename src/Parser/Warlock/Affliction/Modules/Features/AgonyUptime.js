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

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
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
    let text;
    if (this.combatants.selected.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id)) {
      text = <Wrapper>Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved as it is your main source of Soul Shards. Try to pay more attention to your Agony on the boss, especially since you're using <SpellLink id={SPELLS.WRITHE_IN_AGONY_TALENT.id} /> talent.</Wrapper>;
    }
    else {
      text = <Wrapper>Your <SpellLink id={SPELLS.AGONY.id} /> uptime can be improved as it is your main source of Soul Shards. Try to pay more attention to your Agony on the boss, perhaps use some debuff tracker.</Wrapper>;
    }
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(text)
          .icon(SPELLS.AGONY.icon)
          .actual(`${formatPercentage(actual)}% Agony uptime`)
          .recommended(`> ${formatPercentage(recommended)}% is recommended`);
      });
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
