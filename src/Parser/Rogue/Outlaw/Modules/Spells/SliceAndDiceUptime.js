import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

class SliceAndDiceUptime extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.SLICE_AND_DICE_TALENT.id);
  }

  get percentUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SLICE_AND_DICE_TALENT.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SLICE_AND_DICE_TALENT.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Slice and Dice uptime"
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(100);
}

export default SliceAndDiceUptime;
