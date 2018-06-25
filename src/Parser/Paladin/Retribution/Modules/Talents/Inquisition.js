import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Inquisition extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  on_initialized(event) {
    this.active = this.combatants.selected.hasTalent(SPELLS.INQUISITION_TALENT.id);
  }

  get uptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.INQUISITION_TALENT.id) / this.owner.fightDuration;
  }

  get suggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.85,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<React.Fragment>Your <SpellLink id={SPELLS.INQUISITION_TALENT.id} icon /> uptime is low</React.Fragment>)
        .icon(SPELLS.INQUISITION_TALENT.icon)
        .actual(`${formatPercentage(this.uptime)}% uptime`)
        .recommended(`>${formatPercentage(recommended)}% is recommended`);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.INQUISITION_TALENT.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Inquisition Uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default Inquisition;
