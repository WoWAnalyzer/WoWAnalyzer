import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault} from 'common/stats';
import { formatPercentage, formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';

/**
 * Construct Overcharger -
 * Equip: Your attacks have a chance to increase your Haste by 21 for 10 sec, stacking up to 8 times.
 */

class ConstructOvercharger extends Analyzer{
  statBuff = 0;

  constructor(...args){
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.CONSTRUCT_OVERCHARGER.id);
    if(this.active){
      this.statBuff = calculateSecondaryStatDefault(355, 35, this.selectedCombatant.getItem(ITEMS.CONSTRUCT_OVERCHARGER.id).itemLevel);
    }
  }

  averageStatGain(){
    const averageStacks = this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.TITANIC_OVERCHARGE.id) / this.owner.fightDuration;
    return averageStacks * this.statBuff;
  }

  totalBuffUptime(){
    return this.selectedCombatant.getBuffUptime(SPELLS.TITANIC_OVERCHARGE.id)/this.owner.fightDuration;
  }

  buffTriggerCount(){
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.TITANIC_OVERCHARGE.id);
  }

  item(){
    return {
      item: ITEMS.CONSTRUCT_OVERCHARGER,
      result: (
        <dfn data-tip={`Procced ${this.buffTriggerCount()} times.`}>
          {formatPercentage(this.totalBuffUptime())}% uptime.<br />
          {formatNumber(this.averageStatGain())} average Haste.
        </dfn>
      ),
    };
  }
}

export default ConstructOvercharger;
