import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import StatisticBox from "Main/StatisticBox";
import SpellIcon from "common/SpellIcon";
import { formatPercentage } from "common/format";
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

class EnvenomUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get percentUptime() {
    return this.combatants.selected.getBuffUptime(SPELLS.ENVENOM.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ENVENOM.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label={`Envenom Uptime`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(120);

}

export default EnvenomUptime;
