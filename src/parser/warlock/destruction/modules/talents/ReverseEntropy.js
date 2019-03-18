import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';

import Statistic from 'interface/statistics/Statistic';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import UptimeIcon from 'interface/icons/Uptime';

class ReverseEntropy extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.REVERSE_ENTROPY_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.REVERSE_ENTROPY_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic size="small">
        <BoringSpellValueText spell={SPELLS.REVERSE_ENTROPY_TALENT}>
          <UptimeIcon /> {formatPercentage(this.uptime, 0)} % <small>uptime</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ReverseEntropy;
