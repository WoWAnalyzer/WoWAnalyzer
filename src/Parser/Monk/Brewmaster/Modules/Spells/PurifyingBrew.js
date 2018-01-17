import React from 'react';
import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';
import Analyzer from 'Parser/Core/Analyzer';
import SharedBrews from '../Core/SharedBrews';

class PurifyingBrew extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
    combatants: Combatants,
  };

  purifyAmounts = [];

  heavyPurifies = 0;

  _heavyStaggerDropped = false;

  on_byPlayer_removedebuff(event) {
    if(event.ability.guid === SPELLS.HEAVY_STAGGER_DEBUFF.id) {
      this._heavyStaggerDropped = true;
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
      // reset this, something else took us out of heavy stagger
      this._heavyStaggerDropped = false; 
      return;
    }
    this.purifyAmounts.push(event.amount);
    if(this.combatants.selected.hasBuff(SPELLS.HEAVY_STAGGER_DEBUFF.id) || this._heavyStaggerDropped) {
      this.heavyPurifies += 1;
    }
    this._heavyStaggerDropped = false;
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
