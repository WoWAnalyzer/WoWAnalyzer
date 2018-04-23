import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

import DamageDone from 'Parser/Core/Modules/DamageDone';

import BattleCryAnalyzer from './BattleCry';

/**
 * Analyzer for damage dealt during Battle Cries.
 * @extends BattleCryAnalyzer
 */
class BattleCryDamageAnalyzer extends BattleCryAnalyzer {
  static dependencies = {
    damageDone: DamageDone,
  };

  battleCryDamageDone = 0;

  battleCryDamage(event) {
    this.battleCryDamageDone += event.amount + event.absorbed;
  }

  statistic() {
    const battleCryDamage = this.battleCryDamageDone;
    const totalDamage = this.damageDone.total.effective;

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.BATTLE_CRY.id} />}
        value={`${formatNumber(battleCryDamage / this.battleCryCount)}`}
        label="Average damage during Battle Cry"
        tooltip={`Damage dealt during Battle Cry contributed ${formatPercentage(battleCryDamage / totalDamage)}% of your total damage done.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(4);
}

export default BattleCryDamageAnalyzer;
