import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import { formatPercentage } from 'common/format';
import StatisticBox, { STATISTIC_ORDER } from 'Interface/Others/StatisticBox';

import Analyzer from 'Parser/Core/Analyzer';
import Enemies from 'Parser/Core/Modules/Enemies';


class SymbolsOfDeathUptime extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  statistic() {
    const symbolsOfDeathUptime = this.selectedCombatant.getBuffUptime(SPELLS.SYMBOLS_OF_DEATH.id) / this.owner.fightDuration;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.SYMBOLS_OF_DEATH.id} />}
        value={`${formatPercentage(symbolsOfDeathUptime)} %`}
        label="Symbols of Death uptime"
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.CORE(3);
}

export default SymbolsOfDeathUptime;
