import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class EmpowerWards extends Module {
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
        label='Empower Wards Uptime'
        tooltip={`The Empower Wards total uptime was ${formatDuration(empowerWardsUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}

export default EmpowerWards;
