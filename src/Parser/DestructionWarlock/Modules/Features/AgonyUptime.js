import React from 'react';

import Module from 'Parser/Core/Module';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellLink from 'common/SpellLink';

class AgonyUptime extends Module {
  static dependencies = {
    enemies: Enemies,
  };

  suggestions(when) {
    const agonyUptime = this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
    if (this.owner.selectedCombatant.hasTalent(SPELLS.WRITHE_IN_AGONY_TALENT.id)) {
      when(agonyUptime).isLessThan(0.95)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your Agony uptime can be improved. Try to pay more attention to your Agony on the boss, especially since you're using <SpellLink id={SPELLS.WRITHE_IN_AGONY_TALENT.id}/> talent.</span>)
            .icon(SPELLS.AGONY.icon)
            .actual(`${formatPercentage(actual)}% Agony uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
    }
    else {
      when(agonyUptime).isLessThan(0.85)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest('Your Agony uptime can be improved. Try to pay more attention to your Agony on the boss, perhaps use some debuff tracker.')
            .icon(SPELLS.AGONY.icon)
            .actual(`${formatPercentage(actual)}% Agony uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.05).major(recommended - 0.15);
        });
    }
  }

  statistic() {
    const agonyUptime = this.enemies.getBuffUptime(SPELLS.AGONY.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.AGONY.id} />}
        value={`${formatPercentage(agonyUptime)} %`}
        label='Agony uptime'
    />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default AgonyUptime;
