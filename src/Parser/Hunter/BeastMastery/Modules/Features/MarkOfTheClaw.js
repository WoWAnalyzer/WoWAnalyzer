import React from 'react';

import SPELLS from 'common/SPELLS/index';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatPercentage } from "common/format";

class MarkOfTheClaw extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  get percentUptime() {
    //This calculates the uptime over the course of the encounter of Mark of the Claw
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.MARK_OF_THE_CLAW.id) / this.owner.fightDuration;

    return uptime;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MARK_OF_THE_CLAW.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label={`Mark of the Claw Uptime`}
      />
    );
  }
}

export default MarkOfTheClaw;
