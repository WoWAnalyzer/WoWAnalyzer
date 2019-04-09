import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import UptimeIcon from 'interface/icons/Uptime';
import HasteIcon from 'interface/icons/Haste';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

/**
 * Seabreeze -
 * Equip: Your spells have a chance to grant you 89 Haste, increasing to 890 over 30 sec.
 */
class Seabreeze extends Analyzer {
  statBuff = 0;
  statBudget = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasMainHand(ITEMS.SEABREEZE.id);

    if(this.active) {
      this.statBuff = calculateSecondaryStatDefault(300, 84, this.selectedCombatant.getItem(ITEMS.SEABREEZE.id).itemLevel);
      this.statBudget = calculateSecondaryStatDefault(340, 200, this.selectedCombatant.getItem(ITEMS.SEABREEZE.id).itemLevel);
    }

  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SEABREEZE_BUFF.id) / this.owner.fightDuration;
  }

  get averageStatGain(){
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.SEABREEZE_BUFF.id) / this.owner.fightDuration;
    return averageStacks * this.statBuff;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={`The stat budget for a non-proc main hand would yield ${formatNumber(this.statBudget)} secondary stats`}
      >
        <BoringItemValueText item={ITEMS.SEABREEZE}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime)}% <small>uptime</small> <br />
          <HasteIcon /> {formatNumber(this.averageStatGain)} <small>average Haste gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default Seabreeze;
