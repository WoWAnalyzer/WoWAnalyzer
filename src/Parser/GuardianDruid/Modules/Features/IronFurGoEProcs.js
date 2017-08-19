import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import GuardianOfElune from './GuardianOfElune';

class IronFurGoEProcs extends GuardianOfElune {
  statistic() {
    return (
      this.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.IRONFUR.id} />}
        value={`${formatPercentage(this.nonGoEIronFur/(this.nonGoEIronFur + this.GoEIronFur))}%`}
        label='Unbuffed Ironfur'
        tooltip={`You cast <b>${this.nonGoEIronFur + this.GoEIronFur}</b> total ${SPELLS.IRONFUR.name} and <b> ${this.GoEIronFur} were buffed by 25%</b>.`}
      />)
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(9);
}
  
export default IronFurGoEProcs;
