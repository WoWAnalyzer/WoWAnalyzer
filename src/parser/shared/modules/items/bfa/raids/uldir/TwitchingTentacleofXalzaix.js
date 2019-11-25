import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { formatPercentage, formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';
import ItemStatistic from 'interface/statistics/ItemStatistic';
import BoringItemValueText from 'interface/statistics/components/BoringItemValueText';
import IntellectIcon from 'interface/icons/Intellect';
import UptimeIcon from 'interface/icons/Uptime';
import StatTracker from 'parser/shared/modules/StatTracker';
import Analyzer from 'parser/core/Analyzer';

/**
 * Twitching Tentacle of Xalzaix -
 * Equip: Your spells have a chance to grant you the Lingering Power of Xalzaix for 30 sec.
 * When it reaches 5 charges the power is released, increasing your Intellect by 159 for 12 sec.
 * 
 * Test Log: /report/ABH7D8W1Qaqv96mt/2-Mythic+Taloc+-+Kill+(4:12)/Halshuggen/statistics
 *
 * @property {StatTracker} statTracker
 */
class TwitchingTentacleofXalzaix extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  _item = null;
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this._item = this.selectedCombatant.getTrinket(ITEMS.TWITCHING_TENTACLE_OF_XALZAIX.id);
    this.active = !!this._item;

    if (this.active) {
      this.statBuff = calculatePrimaryStat(340, 850, this._item.itemLevel);
      this.statTracker.add(SPELLS.UNCONTAINED_POWER.id, {
        intellect: this.statBuff,
      });
    }
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.UNCONTAINED_POWER.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <ItemStatistic
        size="flexible"
      >
        <BoringItemValueText item={ITEMS.TWITCHING_TENTACLE_OF_XALZAIX}>
          <UptimeIcon /> {formatPercentage(this.totalBuffUptime, 0)}% <small>uptime</small> <br />
          <IntellectIcon /> {formatNumber(this.totalBuffUptime * this.statBuff)} <small>average {this.selectedCombatant.spec.primaryStat} gained</small>
        </BoringItemValueText>
      </ItemStatistic>
    );
  }
}

export default TwitchingTentacleofXalzaix;
