import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault } from 'common/stats';
import { formatPercentage, formatNumber } from 'common/format';
import UptimeIcon from 'interface/icons/Uptime';
import HasteIcon from 'interface/icons/Haste';
import Analyzer from 'parser/core/Analyzer';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';

/**
 * Construct Overcharger -
 * Equip: Your attacks have a chance to increase your Haste by X for 10 sec, stacking up to 8 times.
 * 
 * Test Log: https://www.warcraftlogs.com/reports/vwm4Xaz9kMcp1LGB#fight=1&type=summary&source=24
 */

class ConstructOvercharger extends Analyzer {
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.CONSTRUCT_OVERCHARGER.id);
    if (this.active) {
      this.statBuff = calculateSecondaryStatDefault(385, 60, this.selectedCombatant.getItem(ITEMS.CONSTRUCT_OVERCHARGER.id).itemLevel);
    }
  }

  get averageStatGain() {
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.TITANIC_OVERCHARGE.id) / this.owner.fightDuration;
    return averageStacks * this.statBuff;
  }
  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.TITANIC_OVERCHARGE.id) / this.owner.fightDuration;
  }

  buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.TITANIC_OVERCHARGE.id);
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
        tooltip={`Procced ${this.buffTriggerCount()} times.`}
      >
        <BoringItemValueText item={ITEMS.CONSTRUCT_OVERCHARGER}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime, 0)}% <small>uptime</small><br />
          <HasteIcon /> {formatNumber(this.averageStatGain)} <small>average Haste gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default ConstructOvercharger;
