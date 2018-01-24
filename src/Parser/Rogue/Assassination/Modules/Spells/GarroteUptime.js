import React from 'react';

import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

class GarroteUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  get percentUptime() {
    return this.enemies.getBuffUptime(SPELLS.GARROTE.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.GARROTE.id} />}
        value={`${formatPercentage(this.percentUptime)}%`}
        label={`Garrote Uptime`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(110);

}

export default GarroteUptime;
