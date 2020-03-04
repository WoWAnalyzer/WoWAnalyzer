import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import ITEMS from 'common/ITEMS';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import ItemLink from 'common/ItemLink';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage, formatNumber } from 'common/format';
import HasteIcon from 'interface/icons/Haste';
import { calculateSecondaryStatDefault } from 'common/stats';

class VitaChargedTitanshard extends Analyzer {

  static dependencies = {
    statTracker: StatTracker,
  };

  hasteRating = null;

  constructor(...args) {
    super(...args);
    this._item = this.selectedCombatant.getTrinket(ITEMS.VITA_CHARGED_TITANSHARD.id);
    this.active = !!this._item;

    if (this.active) {
      this.hasteRating = calculateSecondaryStatDefault(445, 1525, this._item.itemLevel);
      this.statTracker.add(SPELLS.VITA_CHARGED_BUFF.id, {
        haste: this.hasteRating,
      });
    }
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.VITA_CHARGED_BUFF.id) / this.owner.fightDuration;
  }
  get averageHasteRating() {
    return this.hasteRating * this.uptime;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <div className="pad">
          <label><ItemLink id={ITEMS.VITA_CHARGED_TITANSHARD.id} details={this._item} /></label>

          <div className="value">
            <UptimeIcon /> {formatPercentage(this.uptime, 0)}% <small>uptime</small><br />
            <HasteIcon /> {formatNumber(this.averageHasteRating)} <small>average Haste gained</small><br />
          </div>
        </div>
      </Statistic>
    );
  }
}

export default VitaChargedTitanshard;
