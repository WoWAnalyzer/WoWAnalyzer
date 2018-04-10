import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatPercentage } from "common/format";
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

/**
 * Sends you and your pet into a rage, increasing all damage you both deal by 25% for 15 sec.
 * Bestial Wrath's remaining cooldown is reduced by 12 sec each time you use Dire Frenzy or Dire Beast
 */

class BestialWrathUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Bestial Wrath
    return this.combatants.selected.getBuffUptime(SPELLS.BESTIAL_WRATH.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BESTIAL_WRATH.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label={`Bestial Wrath Uptime`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(10);

}

export default BestialWrathUptime;
