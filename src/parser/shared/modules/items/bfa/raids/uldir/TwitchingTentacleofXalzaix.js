import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage, formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import IntellectIcon from 'interface/icons/Intellect';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import ItemLink from 'common/ItemLink';

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

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS}>
        <div className="pad">
          <label><ItemLink id={ITEMS.TWITCHING_TENTACLE_OF_XALZAIX.id} /></label>

          <div className="value">
            <UptimeIcon /> {formatPercentage(this.totalBuffUptime, 0)}% <small>uptime</small><br />
            <IntellectIcon /> {formatNumber(this.totalBuffUptime * this.statBuff)} <small>average {this.selectedCombatant.spec.primaryStat}</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default TwitchingTentacleofXalzaix;
