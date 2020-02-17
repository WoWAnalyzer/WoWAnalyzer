import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import { Item } from 'parser/core/Events';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import ItemLink from 'common/ItemLink';

import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import StatTracker from 'parser/shared/modules/StatTracker';
import { calculateSecondaryStatDefault, calculateSecondaryStatJewelry } from 'common/stats';
import { formatNumber } from 'common/format';
import HasteIcon from 'interface/icons/Haste';
import SpeedIcon from 'interface/icons/Speed';

class HummingBlackDragonscale extends Analyzer {
  static dependencies = {
    statTracker: StatTracker,
  };

  item: Item | undefined;
  hasteRating: number = 0;
  speedRating: number = 0;

  constructor(options: any) {
    super(options);

    this.item = this.selectedCombatant.getTrinket(ITEMS.HUMMING_BLACK_DRAGONSCALE.id);
    this.active = Boolean(this.item);

    if (!this.active) {
      return;
    }

    this.hasteRating = calculateSecondaryStatDefault(430, 383, this.item?.itemLevel);
    this.speedRating = calculateSecondaryStatJewelry(430, 170, this.item?.itemLevel);
    options.statTracker.add(SPELLS.HUMMING_BLACK_DRAGONSCALE_BUFF.id, {
      haste: this.hasteRating,
      speed: this.speedRating,
    });
  }

  get uptime() {
    return this.selectedCombatant.getBuffUptime(SPELLS.HUMMING_BLACK_DRAGONSCALE_BUFF.id) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
        <div className="pad">
          <label><ItemLink id={this.item?.id} details={this.item} /></label>

          <div className="value">
            <HasteIcon /> {formatNumber(this.hasteRating * this.uptime)} <small>average Haste gained</small><br />
            <SpeedIcon /> {formatNumber(this.speedRating * this.uptime)} <small>average Speed gained</small>
          </div>
        </div>
      </Statistic>
    );
  }
}

export default HummingBlackDragonscale;
