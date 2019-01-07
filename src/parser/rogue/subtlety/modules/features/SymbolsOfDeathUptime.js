import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';

import Analyzer from 'parser/core/Analyzer';
import Enemies from 'parser/shared/modules/Enemies';


class SymbolsOfDeathUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  statistic() {
    const symbolsOfDeathUptime = this.selectedCombatant.getBuffUptime(SPELLS.SYMBOLS_OF_DEATH.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(30)}
        icon={<SpellIcon id={SPELLS.SYMBOLS_OF_DEATH.id} />}
        value={`${formatPercentage(symbolsOfDeathUptime)} %`}
        label="Symbols of Death uptime"
      />
    );
  }
}

export default SymbolsOfDeathUptime;
