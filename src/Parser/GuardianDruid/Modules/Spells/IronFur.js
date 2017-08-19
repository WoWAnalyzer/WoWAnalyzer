import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class IronFur extends Module {
  statistic() {
    const totalIronFurTime = this.owner.selectedCombatant.getBuffUptime(SPELLS.IRONFUR.id);
   
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(totalIronFurTime/this.owner.fightDuration)}%`}
        label='Total Ironfur uptime'
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);
}
  
export default IronFur;
