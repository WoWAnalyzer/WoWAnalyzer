import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import GuardianOfElune from './GuardianOfElune';

class FrenziedRegenGoEProcs extends GuardianOfElune {
  statistic() {
    return (
      this.active && (<StatisticBox
        icon={<SpellIcon id={SPELLS.FRENZIED_REGENERATION.id} />}
        value={`${formatPercentage(this.nonGoEFRegen/(this.nonGoEFRegen + this.GoEFRegen))}%`}
        label='Unbuffed Frenzied Regen'
        tooltip={`You cast <b>${this.nonGoEFRegen + this.Regen}</b> total ${SPELLS.FRENZIED_REGENERATION.name} and <b> ${this.GoEFRegen} were buffed by 25%</b>.`}
      />)
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(8);
}
  
export default FrenziedRegenGoEProcs;
