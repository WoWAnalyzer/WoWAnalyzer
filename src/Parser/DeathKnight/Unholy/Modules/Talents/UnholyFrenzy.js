import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class UnholyFrenzyUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.UNHOLY_FRENZY_TALENT.id);
  }

  suggestions(when) {
    const ufUptime = this.combatants.selected.getBuffUptime(SPELLS.UNHOLY_FRENZY_BUFF.id) / this.owner.fightDuration;
    when(ufUptime).isLessThan(0.80)
        .addSuggestion((suggest, actual, recommended) => {
          return suggest(<span>Your <SpellLink id={SPELLS.UNHOLY_FRENZY_BUFF.id}/> uptime can be improved.  Make sure you are regularly casting <SpellLink id={SPELLS.SCOURGE_STRIKE.id}/> on targets with <SpellLink id={SPELLS.FESTERING_WOUND.id}/>.</span>)
            .icon(SPELLS.UNHOLY_FRENZY_BUFF.icon)
            .actual(`${formatPercentage(actual)}% Unholy Frenzy Uptime`)
            .recommended(`>${formatPercentage(recommended)}% is recommended`)
            .regular(recommended - 0.08).major(recommended - 0.18);
        });
  }

  statistic() {
    const ufUptime = this.combatants.getBuffUptime(SPELLS.UNHOLY_FRENZY_BUFF.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.UNHOLY_FRENZY_BUFF.id} />}
        value={`${formatPercentage(ufUptime)} %`}
        label="Unholy Frenzy Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(7);
}

export default UnholyFrenzyUptime;
