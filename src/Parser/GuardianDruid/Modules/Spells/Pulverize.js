import React from 'react';
import { formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';

class Pulverize extends Module {

  suggestions(when) {
    const pulverizeUptimePercentage = this.owner.selectedCombatant.getBuffUptime(SPELLS.PULVERIZE_BUFF.id) / this.owner.fightDuration;
    
    this.owner.selectedCombatant.hasTalent(SPELLS.PULVERIZE_TALENT.id) && 
    when(pulverizeUptimePercentage).isLessThan(0.9)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span> Your <SpellLink id={SPELLS.PULVERIZE_TALENT.id} /> uptime should be near 100%, unless there are extended periods of downtime. All targets deal less damage to you due to the <SpellLink id={SPELLS.PULVERIZE_BUFF.id} /> buff.</span>)
          .icon(SPELLS.PULVERIZE_TALENT.icon)
          .actual(`${formatPercentage(pulverizeUptimePercentage)}% uptime`)
          .recommended(`${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(recommended - 0.1).major(recommended - 0.2);
      });
  }

  statistic() {
    const pulverizeUptimePercentage = this.owner.selectedCombatant.getBuffUptime(SPELLS.PULVERIZE_BUFF.id) / this.owner.fightDuration;
    
    return (
      this.owner.selectedCombatant.hasTalent(SPELLS.PULVERIZE_TALENT.id) && (<StatisticBox
        icon={<SpellIcon id={SPELLS.PULVERIZE_TALENT.id} />}
        value={`${formatPercentage(pulverizeUptimePercentage)}%`}
        label='Pulverize uptime'
      />)
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(13);
}
  
export default Pulverize;
