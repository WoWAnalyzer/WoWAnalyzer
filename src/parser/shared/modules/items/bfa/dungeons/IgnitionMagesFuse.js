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
 * Ignition Mage's Fuse -
 * Use: Ignite the fuse, gaining 312 Haste every 4 sec. Haste is removed after 20 sec.
 */
class IgnitionMagesFuse extends Analyzer {
  statBuff = 0;
  statBudget = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.IGNITION_MAGES_FUSE.id);

    if(this.active) {
      this.statBuff = calculateSecondaryStatDefault(300, 84, this.selectedCombatant.getItem(ITEMS.IgnitionMagesFuse.id).itemLevel);
      this.statBudget = calculateSecondaryStatDefault(340, 200, this.selectedCombatant.getItem(ITEMS.IgnitionMagesFuse.id).itemLevel);
    }

  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.IgnitionMagesFuse_BUFF.id) / this.owner.fightDuration;
  }

  get averageStatGain(){
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.IgnitionMagesFuse_BUFF.id) / this.owner.fightDuration;
    return averageStacks * this.statBuff;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={`The stat budget for a non-proc main hand would yield ${formatNumber(this.statBudget)} secondary stats`}
      >
        <BoringItemValueText item={ITEMS.IgnitionMagesFuse}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime)}% <small>uptime</small> <br />
          <HasteIcon /> {formatNumber(this.averageStatGain)} <small>average Haste gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default IgnitionMagesFuse;
