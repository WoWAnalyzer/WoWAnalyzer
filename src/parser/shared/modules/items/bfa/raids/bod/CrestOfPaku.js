import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import { calculateSecondaryStatDefault } from 'common/stats';
import { formatPercentage, formatNumber } from 'common/format';
import ItemLink from 'common/ItemLink';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import HasteIcon from 'interface/icons/Haste';
import UptimeIcon from 'interface/icons/Uptime';
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

  _item = null;
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
    this._item = this.selectedCombatant.getTrinket(ITEMS.CREST_OF_PAKU_ALLIANCE.id) || this.selectedCombatant.getTrinket(ITEMS.CREST_OF_PAKU_HORDE.id);
    this.active = !!this._item;

    if (this.active) {
      this.hasteRating = calculateSecondaryStatDefault(385, 467, this._item.itemLevel);
      this.speedRating = calculateSecondaryStatDefault(385, 79, this._item.itemLevel);
      this.statTracker.add(SPELLS.GIFT_OF_WIND_BUFF.id, {
        haste: this.hasteRating,
        speed: this.speedRating,
      });
    }
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <div className="pad">
          <label><ItemLink id={ITEMS.CREST_OF_PAKU_ALLIANCE.id} details={this._item} /></label>

          <div className="value">
            <UptimeIcon /> {formatPercentage(this.uptime, 0)}% <small>uptime</small><br />
            <HasteIcon /> {formatNumber(this.averageHasteRating)} <small>average Haste gained</small><br />
            {formatNumber(this.averageHasteRating)} <small>average Speed gained</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default CrestOfPaku;
