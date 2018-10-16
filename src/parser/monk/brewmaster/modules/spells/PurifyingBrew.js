import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox from 'interface/others/StatisticBox';

import SharedBrews from '../core/SharedBrews';

const PURIFY_DELAY_THRESHOLD = 1250; // 1.25s, gives a bit of flexibility in case the brew-GCD is rolling right when a hit comes in

function markupPurify(event, delay, hasHeavyStagger) {
  const msgs = [];
  if(delay > PURIFY_DELAY_THRESHOLD) {
    msgs.push(`<li>You delayed casting it for <b>${(delay / 1000).toFixed(2)}s</b>, allowing Stagger to tick down.</li>`);
  }
  if(!hasHeavyStagger) {
    msgs.push(`<li>You cast without reaching at least Heavy Stagger, which is <em>almost always</em> inefficient.</li>`);
  }

  if(msgs.length === 0) {
    return;
  }
  const meta = event.meta || {};
  meta.isInefficientCast = true;
  meta.inefficientCastReason = `This Purifying Brew cast was inefficient because:<ul>${msgs.join('')}</ul>`;
  event.meta = meta;
}

class PurifyingBrew extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
    spells: SpellUsable,
  };

  purifyAmounts = [];
  purifyDelays = [];

  heavyPurifies = 0;

  // used to track heavy stagger for when the debuff drops just before the
  // cast event happens
  _heavyStaggerDropped = false;

  _lastHit = null;
  _msTilPurify = 0;

  on_byPlayer_removedebuff(event) {
    if (event.ability.guid === SPELLS.HEAVY_STAGGER_DEBUFF.id) {
      this._heavyStaggerDropped = true;
    }
  }

  get meanPurify() {
    if (this.purifyAmounts.length === 0) {
      return 0;
    }

    return this.totalPurified / this.totalPurifies;
  }

  get minPurify() {
    if (this.purifyAmounts.length === 0) {
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

  get avgPurifyDelay() {
    if(this.purifyDelays.length === 0) {
      return 0;
    }
    return this.purifyDelays.reduce((delay, total) => total + delay) / this.purifyDelays.length;
  }

  on_addstagger(event) {
    this._lastHit = event;
    this._msTilPurify = this.spells.isAvailable(SPELLS.PURIFYING_BREW.id) ? 0 : this.spells.cooldownRemaining(SPELLS.PURIFYING_BREW.id);
  }

  on_removestagger(event) {
    // tracking gap from peak --- ideally you want to purify as close to
    // a peak as possible, but if no purify charges are available we
    // want to get the new pooled amount
    const gap = event.timestamp - this._lastHit.timestamp;
    if(event.trigger.ability.guid === SPELLS.STAGGER.id && this._msTilPurify - gap > 0) {
      this._msTilPurify = Math.max(0, this._msTilPurify - gap);
      this._lastHit = event;
    }

    // tracking purification
    if (!event.trigger.ability || event.trigger.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      // reset this, if we lost heavy stagger then death or another ability took us out of heavy stagger
      this._heavyStaggerDropped = false;
      return;
    }
    this.purifyAmounts.push(event.amount);
    const delay = event.timestamp - this._lastHit.timestamp - this._msTilPurify;
    this.purifyDelays.push(delay);
    const hasHeavyStagger = this.selectedCombatant.hasBuff(SPELLS.HEAVY_STAGGER_DEBUFF.id) || this._heavyStaggerDropped;
    markupPurify(event.trigger, delay, hasHeavyStagger);
    if (hasHeavyStagger) {
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
                  You purified <b>${this.badPurifies}</b> (${formatPercentage(this.badPurifies / this.totalPurifies)}%) times without reaching Heavy Stagger.<br/>
                  Your purifies were delayed from the nearest peak by <b>${(this.avgPurifyDelay / 1000).toFixed(2)}s</b> on average.`}
      />
    );
  }
}

export default PurifyingBrew;
