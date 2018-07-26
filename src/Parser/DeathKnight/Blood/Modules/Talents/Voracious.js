import React from 'react';
import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

class Voracious extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.VORACIOUS_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.VORACIOUS.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: .8,
      },
      style: 'percentage',
    };
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.VORACIOUS_TALENT.id} />}
        value={`${formatPercentage(this.uptime)} %`}
        label="Voracious uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default Voracious;
