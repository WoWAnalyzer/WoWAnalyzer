import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import SmallStatisticBox, { STATISTIC_ORDER } from 'Main/SmallStatisticBox';

class TwistOfFate extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.TWIST_OF_FATE_TALENT.id);
  }

  statistic() {
    const uptime = this.combatants.selected.getBuffUptime(SPELLS.TWIST_OF_FATE_BUFF.id) / this.owner.fightDuration;
    return (<SmallStatisticBox
      icon={<SpellIcon id={SPELLS.TWIST_OF_FATE_BUFF.id} />}
      value={`${formatPercentage(uptime)} %`}
      label="Twist of Fate uptime"
    />);
  }

  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default TwistOfFate;
