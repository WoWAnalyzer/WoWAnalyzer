import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import Analyzer from 'parser/core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculatePrimaryStat } from 'common/stats';

/**
 * Gilded Loa Figurine -
 * Equip: Your spells and abilities have a chance to increase your primary stat by 814 for 10 sec.
 */
class GildedLoaFigurine extends Analyzer {
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.GILDED_LOA_FIGURINE.id);

    if(this.active) {
      this.statBuff = calculatePrimaryStat(280, 676, this.selectedCombatant.getItem(ITEMS.GILDED_LOA_FIGURINE.id).itemLevel);
    }
  }

  get buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.WILL_OF_THE_LOA.id);
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.WILL_OF_THE_LOA.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.GILDED_LOA_FIGURINE,
      result: (
        <dfn data-tip={`Procced ${this.buffTriggerCount} times`}>
          {formatPercentage(this.totalBuffUptime)}% uptime<br />
          {formatNumber(this.totalBuffUptime * this.statBuff)} average {this.selectedCombatant.spec.primaryStat}
        </dfn>
      ),
    };
  }
}

export default GildedLoaFigurine;
