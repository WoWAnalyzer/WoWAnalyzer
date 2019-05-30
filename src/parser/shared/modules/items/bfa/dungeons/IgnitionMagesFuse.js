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
import StatTracker from 'parser/shared/modules/StatTracker';
/**
  Ignition Mage's Fuse
  Item Level 340
  Binds when picked up
  Unique-Equipped
  Trinket	
  +205 Intellect
  Use: Ignite the fuse, gaining 168 Haste every 4 sec. Haste is removed after 20 sec. (2 Min Cooldown)
 */

class IgnitionMagesFuse extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    statTracker: StatTracker,
  };

  statBuff = 0;
  casts = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.IGNITION_MAGES_FUSE.id);

    if(this.active) {
      this.statBuff = calculateSecondaryStatDefault(340, 164, this.selectedCombatant.getItem(ITEMS.IGNITION_MAGES_FUSE.id).itemLevel);
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.IGNITION_MAGES_FUSE.id), this.onCast);
    }
  }

  onCast(event) {
    this.casts += 1;
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.IGNITION_MAGES_FUSE.id) / this.owner.fightDuration;
  }

  get averageStatGain(){
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.IGNITION_MAGES_FUSE.id) / this.owner.fightDuration;
    return averageStacks * this.statBuff;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.IGNITION_MAGES_FUSE}>
          <HasteIcon /> {formatNumber(this.averageStatGain)} <small>average Haste gained</small> <br />
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}


export default IgnitionMagesFuse;
