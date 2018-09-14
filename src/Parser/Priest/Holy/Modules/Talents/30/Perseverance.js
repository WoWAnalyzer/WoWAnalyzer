import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage } from 'common/format';

class Perseverance extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.PERSEVERANCE_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RENEW.id) / this.owner.fightDuration;
  }

  get uptimeSuggestionThresholds() {
    return {
      actual: this.uptime,
      isLessThan: {
        minor: 0.80,
        average: 0.70,
        major: .60,
      },
      style: 'percentage',
    };
  }
}

export default Perseverance;
