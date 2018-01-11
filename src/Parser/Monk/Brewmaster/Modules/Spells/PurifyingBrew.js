import React from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SharedBrews from '../Core/SharedBrews';

const HEAVY_STAGGER_LEVEL = 2/3;

class PurifyingBrew extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
    combatants: Combatants,
  };

  purifyAmounts = [];

  heavyPurifies = 0;

  on_byPlayer_cast(event) {
    if(event.ability.guid === SPELLS.PURIFYING_BREW.id) {
      this.brews.consumeCharge(event);
    }
  }

  get meanPurify() {
    if(this.purifyAmounts.length === 0) {
      return 0;
    }

    return this.totalPurified / this.totalPurifies;
  }

  get minPurify() {
    if(this.purifyAmounts.length === 0) {
      return 0;
    }

    return this.purifyAmounts.reduce((prev, cur) => (prev < cur) ? prev : cur, Infinity);
  }

  get maxPurify() {
    return this.purifyAmounts.reduce((prev, cur) => (prev > cur) ? prev : cur, 0);
  }

  get totalPurified() {
    return this.purifyAmounts.reduce((prev, cur) => prev + cur, 0);
  }

  get badPurifies() {
    return this.totalPurifies - this.heavyPurifies;
  }

  get totalPurifies() {
    return this.purifyAmounts.length;
  }

  on_removestagger(event) {
    if(event.reason.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      return;
    }
    this.purifyAmounts.push(event.amount);
    // cannot (easily) rely on this.combatants.selected.hasBuff due to
    // ordering issues
    if(event.amount + event.newPooledDamage >= HEAVY_STAGGER_LEVEL * event.reason.maxHitPoints) {
      this.heavyPurifies += 1;
    }
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PURIFYING_BREW.id} />}
        value={`${formatNumber(this.meanPurify)}`}
        label="Avg. Mitigation per Purifying Brew"
        tooltip={`Purifying Brew removed <b>${formatNumber(this.totalPurified)}</b> damage in total over ${this.totalPurifies} casts.<br/>
                  The smallest purify removed <b>${formatNumber(this.minPurify)}</b> and the largest purify removed <b>${formatNumber(this.maxPurify)}</b>.<br/>
                  You purified <b>${this.badPurifies}</b> (${formatPercentage(this.badPurifies / this.totalPurifies)}%) times without reaching Heavy Stagger.`}
          />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default PurifyingBrew;
