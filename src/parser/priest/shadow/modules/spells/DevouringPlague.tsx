import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

class DevouringPlague extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  get uptime() {
    return this.enemies.getBuffUptime(SPELLS.DEVOURING_PLAGUE.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(4)} size="flexible">
        <BoringSpellValueText spell={SPELLS.DEVOURING_PLAGUE}>
          <>
            {formatPercentage(this.uptime)}% <small>Uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default DevouringPlague;
