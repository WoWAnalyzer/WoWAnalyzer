import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class BoneShieldUptime extends Analyzer {
  statistic() {
    const boneshieldUptime = this.owner.modules.combatants.getBuffUptime(SPELLS.BONE_SHIELD.id);
    const boneshieldUptimePercentage = boneshieldUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BONE_SHIELD.id} />}
        value={`${formatPercentage(boneshieldUptimePercentage)}%`}
        label="Bone Shield Uptime"
        tooltip="Important to maintain. Provides damage reduction and haste buff while you have at least one charge."
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default BoneShieldUptime;
