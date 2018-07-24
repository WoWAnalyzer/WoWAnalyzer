import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import Enemies from 'Parser/Core/Modules/Enemies';

/**
 * Fire a shot that poisons your target, causing them to take (15% of Attack power) Nature damage instantly and an additional (60% of Attack power) Nature damage over 12/(1+haste) sec.
 */

class SerpentSting extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get uptimePercentage() {
    return this.enemies.getBuffUptime(SPELLS.SERPENT_STING_SV.id) / this.owner.fightDuration;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SERPENT_STING_SV.id} />}
        value={`${formatPercentage(this.uptimePercentage)}%`}
        label="Serpent Sting Uptime"
      />
    );
  }

}

export default SerpentSting;
