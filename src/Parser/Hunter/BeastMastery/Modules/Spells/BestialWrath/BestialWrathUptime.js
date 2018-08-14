import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

/**
 * Sends you and your pet into a rage, increasing all damage you both deal by 25% for 15 sec.
 * Bestial Wrath's remaining cooldown is reduced by 12 sec each time you use Barbed Shot
 *
 * Example log: https://www.warcraftlogs.com/reports/pdm6qYNZ2ktMXDRr#fight=7&type=damage-done&source=8
 */

class BestialWrathUptime extends Analyzer {

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Bestial Wrath
    return this.selectedCombatant.getBuffUptime(SPELLS.BESTIAL_WRATH.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(15)}
        icon={<SpellIcon id={SPELLS.BESTIAL_WRATH.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label="Bestial Wrath Uptime"
      />
    );
  }
}

export default BestialWrathUptime;
