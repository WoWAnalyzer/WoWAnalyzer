import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { formatPercentage } from 'common/format';

import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';

class ReverseEntropy extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.REVERSE_ENTROPY_TALENT.id);
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.REVERSE_ENTROPY_BUFF.id) / this.owner.fightDuration;
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<><SpellLink id={SPELLS.REVERSE_ENTROPY_TALENT.id} /> uptime</>}
        value={`${formatPercentage(this.uptime)} %`}
      />
    );
  }
}

export default ReverseEntropy;
