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

  suggestions(when) {
    const enrageUptime = this.combatants.selected.getBuffUptime(SPELLS.ENRAGE.id) / this.owner.fightDuration;

    when(enrageUptime).isLessThan(0.70)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.ENRAGE.id} /> uptime can be improved.</span>)
          .icon(SPELLS.ENRAGE.icon)
          .actual(`${formatPercentage(actual)}% Enrage uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  statistic() {
    const enrageUptime = this.combatants.selected.getBuffUptime(SPELLS.ENRAGE.id) / this.owner.fightDuration;
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