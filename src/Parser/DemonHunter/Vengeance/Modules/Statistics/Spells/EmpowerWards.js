import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class EmpowerWards extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  statistic() {
    const empowerWardsUptime = this.combatants.selected.getBuffUptime(SPELLS.EMPOWER_WARDS.id);

    const empowerWardsUptimePercentage = empowerWardsUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.EMPOWER_WARDS.id} />}
        value={`${formatPercentage(empowerWardsUptimePercentage)}%`}
        label="Empower Wards Uptime"
        tooltip={`The Empower Wards total uptime was ${formatDuration(empowerWardsUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default EmpowerWards;
