import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';

/**
 * You and your pet attack as one, increasing all damage you both deal by
 * 20% for 20 sec. While Coordinated Assault is active, Kill Command's
 * chance to reset is increased by 25%.
 */

class CoordinatedAssault extends Analyzer {

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Coordinated Assault
    return this.selectedCombatant.getBuffUptime(SPELLS.COORDINATED_ASSAULT.id) / this.owner.fightDuration;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.COORDINATED_ASSAULT.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Coordinated Assault Uptime"
      />
    );
  }

}

export default CoordinatedAssault;
