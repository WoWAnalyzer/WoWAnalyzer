import React from 'react';

import SPELLS from 'common/SPELLS/index';
import ITEMS from 'common/ITEMS/index';
import { calculateSecondaryStatDefault } from 'common/stats';
import { formatPercentage, formatNumber } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import StatTracker from 'parser/shared/modules/StatTracker';

/**
 * Crest of Pa'ku -
 * Equip: Your spells have a chance to increase your Haste by 467 and your Speed by 79 for 15 sec.
 *
 * @property {StatTracker} statTracker
 */
class CrestOfPaku extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  hasteRating = null;
  speedRating = null;
  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.GIFT_OF_WIND_BUFF.id) / this.owner.fightDuration;
  }
  get averageHasteRating() {
    return this.hasteRating * this.uptime;
  }
  get averageSpeedRating() {
    return this.speedRating * this.uptime;
  }

  constructor(...args) {
    super(...args);
    const item = this.selectedCombatant.getItem(ITEMS.CREST_OF_PAKU_ALLIANCE.id) || this.selectedCombatant.getItem(ITEMS.CREST_OF_PAKU_HORDE.id);
    this.active = !!item;

    if (this.active) {
      this.hasteRating = calculateSecondaryStatDefault(385, 467, item.itemLevel);
      this.speedRating = calculateSecondaryStatDefault(385, 79, item.itemLevel);
      this.statTracker.add(SPELLS.GIFT_OF_WIND_BUFF.id, {
        haste: this.hasteRating,
        speed: this.speedRating,
      });
    }
  }

  item() {
    return {
      item: ITEMS.CREST_OF_PAKU_ALLIANCE,
      result: (
        <>
          {formatPercentage(this.uptime)}% uptime<br />
          {formatNumber(this.averageHasteRating)} average Haste gained<br />
          {formatNumber(this.averageSpeedRating)} average Speed gained
        </>
      ),
    };
  }
}

export default CrestOfPaku;
