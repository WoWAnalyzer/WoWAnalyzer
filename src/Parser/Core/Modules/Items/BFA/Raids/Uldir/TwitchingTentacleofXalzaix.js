import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';

/**
 * Twitching Tentacle of Xalzaix -
 * Equip: Your spells have a chance to grant you the Lingering Power of Xalzaix for 30 sec.
 * When it reaches 5 charges the power is released, increasing your Intellect by 159 for 12 sec.
 */
class TwitchingTentacleofXalzaix extends Analyzer {
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.TWITCHING_TENTACLE_OF_XALZAIX.id);

    if(this.active) {
      this.statBuff = calculatePrimaryStat(340, 850, this.selectedCombatant.getItem(ITEMS.TWITCHING_TENTACLE_OF_XALZAIX.id).itemLevel);
    }
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.UNCONTAINED_POWER.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.TWITCHING_TENTACLE_OF_XALZAIX,
      result: (
        <React.Fragment>
          {formatPercentage(this.totalBuffUptime)}% uptime<br />
          {formatNumber(this.totalBuffUptime * this.statBuff)} average {this.selectedCombatant.spec.primaryStat}
        </React.Fragment>
      ),
    };
  }
}

export default TwitchingTentacleofXalzaix;
