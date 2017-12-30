import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatPercentage } from "common/format";
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

class BestialWrathUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Bestial Wrath
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.BESTIAL_WRATH.id) / this.owner.fightDuration;
    return uptime;
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
  statisticOrder = STATISTIC_ORDER.CORE(7);


}

export default BestialWrathUptime;
