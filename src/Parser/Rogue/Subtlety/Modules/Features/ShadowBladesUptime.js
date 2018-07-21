import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';


class ShadowBladesUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  
  statistic() {
    const shadowBladesUptime = this.selectedCombatant.getBuffUptime(SPELLS.SHADOW_BLADES.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SHADOW_BLADES.id} />}
        value={`${formatPercentage(shadowBladesUptime)} %`}
        label="Shadow Blades uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(1);
}

export default ShadowBladesUptime;
