import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

// the buff events all use this spell
export const RUSHING_JADE_WIND_BUFF = SPELLS.RUSHING_JADE_WIND_TALENT; 

class RushingJadeWind extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.RUSHING_JADE_WIND_TALENT.id);
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(RUSHING_JADE_WIND_BUFF.id) / this.owner.fightDuration;
  }

  // using a suggestion rather than a checklist item for this as RJW is
  // purely offensive
  suggestions(when) {
    when(this.uptime).isLessThan(0.95)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper>You had low uptime on <SpellLink id={SPELLS.RUSHING_JADE_WIND.id} />. Try to maintain 100% uptime by refreshing the buff before it drops.</Wrapper>)
          .icon(SPELLS.RUSHING_JADE_WIND.icon)
          .actual(`${formatPercentage(actual)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }
}

export default RushingJadeWind;
