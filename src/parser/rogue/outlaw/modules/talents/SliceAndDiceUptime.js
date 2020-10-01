import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import StatisticBox from 'interface/others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';

class SliceAndDiceUptime extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = true;
  }

  get percentUptime() {
    return (
      this.selectedCombatant.getBuffUptime(SPELLS.SLICE_AND_DICE.id) / this.owner.fightDuration
    );
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SLICE_AND_DICE.id} />}
        position={STATISTIC_ORDER.CORE(100)}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Slice and Dice uptime"
      />
    );
  }
}

export default SliceAndDiceUptime;
