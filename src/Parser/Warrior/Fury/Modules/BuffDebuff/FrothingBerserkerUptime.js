import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class enrageUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.FROTHING_BERSERKER_TALENT.id);
  }

  suggestions(when) {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.FROTHING_BERSERKER.id) / this.owner.fightDuration;

    when(uptime).isLessThan(0.65)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.FROTHING_BERSERKER.id} /> uptime can be improved.</span>)
          .icon(SPELLS.FROTHING_BERSERKER.icon)
          .actual(`${formatPercentage(actual)}% Frothing Berserker uptime`)
          .recommended(`>${formatPercentage(recommended)}% is recommended`)
          .regular(recommended - 0.05).major(recommended - 0.10);
      });
  }

  statistic() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.FROTHING_BERSERKER.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.FROTHING_BERSERKER.id} />}
        value={`${formatPercentage(uptime)} %`}
        label="Frothing Berserker uptime"
      />
    );
  }
}

export default enrageUptime;