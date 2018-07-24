import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage, formatNumber } from 'common/format';
import { calculateSecondaryStatDefault } from 'common/stats';

/**
 * Emblem of Zandalar -
 * Your spells and abilities have a chance to grant you 414 haste for 8 sec.
 */
class EmblemOfZandalar extends Analyzer {
  statBuff = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.EMBLEM_OF_ZANDALAR.id);

    if (this.active) {
      this.statBuff = calculateSecondaryStatDefault(280, 414, this.selectedCombatant.getItem(ITEMS.EMBLEM_OF_ZANDALAR.id).itemLevel);
    }
  }

  get buffTriggerCount() {
    return this.selectedCombatant.getBuffTriggerCount(SPELLS.SPEED_OF_THE_SPIRITS.id);
  }

  get totalBuffUptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.SPEED_OF_THE_SPIRITS.id) / this.owner.fightDuration;
  }

  item() {
    return {
      item: ITEMS.EMBLEM_OF_ZANDALAR,
      result: (
        <dfn data-tip={`Procced ${this.buffTriggerCount} times`}>
          {formatPercentage(this.totalBuffUptime)}% uptime<br />
          {formatNumber(this.totalBuffUptime * this.statBuff)} average haste
        </dfn>
      ),
    };
  }
}

export default EmblemOfZandalar;
