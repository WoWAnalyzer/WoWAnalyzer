import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Enemies from 'Parser/Core/Modules/Enemies';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import { formatPercentage, formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class Nemesis extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    enemies: Enemies,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.NEMESIS_TALENT.id);
  }

  statistic() {
    const nemesisUptime = this.enemies.getBuffUptime(SPELLS.NEMESIS_TALENT.id);
    const nemesisUptimePercentage = nemesisUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.NEMESIS_TALENT.id} />}
        value={`${formatPercentage(nemesisUptimePercentage)}%`}
        label="Nemesis Uptime"
        tooltip={`The Nemesis buff total uptime was ${formatDuration(nemesisUptime / 1000)}.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default Nemesis;
