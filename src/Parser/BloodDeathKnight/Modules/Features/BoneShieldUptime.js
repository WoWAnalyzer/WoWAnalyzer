import React from 'react';

import Module from 'Parser/Core/Module';
import SPELLS from 'common/SPELLS';
import Icon from 'common/Icon';

import { formatPercentage } from 'common/format';
import { formatDuration } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

class BoneShieldUptime extends Module {


  statistic() {

    const boneshieldUptime = this.owner.modules.combatants.getBuffUptime(SPELLS.BONE_SHIELD.id);
    const boneshieldUptimePercentage = boneshieldUptime / this.owner.fightDuration;

    return (
      <StatisticBox
        icon={<Icon icon="ability_deathknight_boneshield" alt="Bone Shield" />}
        value={`${formatPercentage(boneshieldUptimePercentage)}%`}
        label='Bone Shield Uptime'
        tooltip={`Bone Shield total uptime was ${formatDuration(boneshieldUptime / 1000)} seconds.`}
      />

    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(2);
}

export default BoneShieldUptime;
