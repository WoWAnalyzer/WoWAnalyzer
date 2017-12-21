import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import Combatants from 'Parser/Core/Modules/Combatants';

class OssuaryUptime extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.OSSUARY_TALENT.id);
  }

  statistic() {
    const Uptime = this.owner.modules.combatants.getBuffUptime(SPELLS.OSSUARY.id);

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.OSSUARY.id} />}
        value={`${formatPercentage(Uptime / this.owner.fightDuration)}%`}
        label="Ossuary Uptime"
        tooltip="Important to maintain. Reduces cost of Death Strike and increases runic power cap by 10."
      />


    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default OssuaryUptime;
