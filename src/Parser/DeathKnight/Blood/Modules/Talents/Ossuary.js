import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class Ossuary extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id);
  }

  get uptime() {
    return this.combatants.getBuffUptime(SPELLS.OSSUARY.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.94,
        average: 0.84,
        major: .74,
      },
      style: 'percentage',
    };
  }
  statistic() {

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.OSSUARY_TALENT.id} />}
        value={`${formatPercentage(this.uptime)}%`}
        label="Ossuary Uptime"
        tooltip="Important to maintain. Reduces cost of Death Strike and increases runic power cap by 10."
      />


    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Ossuary;
