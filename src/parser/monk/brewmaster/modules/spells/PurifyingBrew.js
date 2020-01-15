import React from 'react';

import { formatNumber, formatPercentage } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox from 'interface/others/StatisticBox';
import calculateMaxCasts from 'parser/core/calculateMaxCasts';

import SharedBrews from '../core/SharedBrews';
import BrewCDR from '../core/BrewCDR';
import IronskinBrew from './IronSkinBrew';

const PURIFY_DELAY_THRESHOLD = 1250; // 1.25s, gives a bit of flexibility in case the brew-GCD is rolling right when a hit comes in

function markupPurify(event, delay, hasHeavyStagger) {
  const msgs = [];
  if(delay > PURIFY_DELAY_THRESHOLD) {
    msgs.push(<li key="PURIFY_DELAY_THRESHOLD">You delayed casting it for <b>{(delay / 1000).toFixed(2)}s</b> after being hit, allowing Stagger to tick down.</li>);
  }
  if(!hasHeavyStagger) {
    msgs.push(<li key="hasHeavyStagger">You cast without reaching at least Heavy Stagger, which is <em>almost always</em> inefficient.</li>);
  }

  if(msgs.length === 0) {
    return;
  }
  const meta = event.meta || {};
  meta.isInefficientCast = true;
  meta.inefficientCastReason = (
    <>
      This Purifying Brew cast was inefficient because:
      <ul>{msgs}</ul>
    </>
  );
  event.meta = meta;
}

class PurifyingBrew extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
    spells: SpellUsable,
    abilities: Abilities,
    cdr: BrewCDR,
    isb: IronskinBrew,
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

  get belowHeavyPurifies() {
    return this.totalPurifies - this.heavyPurifies;
  }

  get totalPurifies() {
    return this.purifyAmounts.length;
  }

  get avgPurifyDelay() {
    if(this.purifyDelays.length === 0) {
      return 0;
    }
    return this.purifyDelays.reduce((total, delay) => total + delay) / this.purifyDelays.length;
  }

  // the number of purifies you *could have* cast without dropping ISB
  // if you didn't clip at all
  get availablePurifies() {
    const ability = this.abilities.getAbility(SPELLS.IRONSKIN_BREW.id);
    const cd = ability._cooldown(this.cdr.meanHaste);
    const castsForUptime = Math.ceil(this.owner.fightDuration / this.isb.durationPerCast);
    const castsAvailable = calculateMaxCasts(cd, this.owner.fightDuration + this.cdr.totalCDR, 3);
    return Math.max(castsAvailable - castsForUptime, 1);
  }

  on_addstagger(event) {
    this._lastHit = event;
    this._msTilPurify = this.spells.isAvailable(SPELLS.PURIFYING_BREW.id) ? 0 : this.spells.cooldownRemaining(SPELLS.PURIFYING_BREW.id);
  }

  on_removestagger(event) {
    if(this._lastHit === null) {
      if(event.amount > 0) {
        console.warn('Stagger removed but player hasn\'t been hit yet', event);
      }
      return; // no hit yet
    }
    // tracking gap from peak --- ideally you want to purify as close to
    // a peak as possible, but if no purify charges are available we
    // want to get the new pooled amount
    const gap = event.timestamp - this._lastHit.timestamp;
    if(event.trigger.ability && event.trigger.ability.guid === SPELLS.STAGGER.id && this._msTilPurify - gap > 0) {
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

  get purifyDelaySuggestion() {
    return {
      actual: this.avgPurifyDelay / 1000,
      isGreaterThan: {
        minor: 1,
        average: PURIFY_DELAY_THRESHOLD / 1000,
        major: PURIFY_DELAY_THRESHOLD / 1000 + 1,
      },
      style: 'seconds',
    };
  }

  get purifyHeavySuggestion() {
    const heavyUptime = this.selectedCombatant.getBuffUptime(SPELLS.HEAVY_STAGGER_DEBUFF.id) / this.owner.fightDuration;
    const threshold = Math.max(1 - 2 * heavyUptime, 0) + 0.1;
    console.log(`Purify threshold: ${threshold}`);
    return {
      actual: this.belowHeavyPurifies / this.totalPurifies,
      isGreaterThan: {
        minor: threshold,
        average: 1.5 * threshold,
        major: 2 * threshold,
      },
      style: 'percentage',
    };
  }

  get purifyCastSuggestion() {
    const target = Math.floor(this.availablePurifies);
    return {
      actual: this.totalPurifies,
      max: target,
      isLessThan: {
        minor: target,
        average: 0.8 * target,
        major: 0.6 * target,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.purifyDelaySuggestion).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You should delay your <SpellLink id={SPELLS.PURIFYING_BREW.id} /> cast as little as possible after being hit to maximize its effectiveness.</>)
        .icon(SPELLS.PURIFYING_BREW.icon)
        .actual(`${actual.toFixed(2)}s Average Delay`)
        .recommended(`< ${recommended.toFixed(2)}s is recommended`);
    });

    when(this.purifyHeavySuggestion).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You should avoid casting <SpellLink id={SPELLS.PURIFYING_BREW.id} /> without being in at least <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} />. While not every fight will put you into <SpellLink id={SPELLS.HEAVY_STAGGER_DEBUFF.id} /> consistently, you should often aim to save your purifies for these parts of the fight.</>)
        .icon(SPELLS.PURIFYING_BREW.icon)
        .actual(`${formatPercentage(actual)}% of your purifies were less than Heavy Stagger`)
        .recommended(`< ${formatPercentage(recommended)}% is recommended`);
    });

    when(this.purifyCastSuggestion).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You should spend brews not needed to maintain <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> on <SpellLink id={SPELLS.PURIFYING_BREW.id} />. <SpellLink id={SPELLS.IRONSKIN_BREW.id} /> has a capped duration, so spending all brews on the buff ultimately wastes resources.</>)
        .icon(SPELLS.PURIFYING_BREW.icon)
        .actual(`${formatNumber(actual)} casts`)
        .recommended(<>{formatNumber(recommended)} could be cast without dropping <SpellLink id={SPELLS.IRONSKIN_BREW.id} /></>);
    });
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PURIFYING_BREW.id} />}
        value={formatNumber(this.meanPurify)}
        label="Avg. Mitigation per Purifying Brew"
        tooltip={(
          <>
            Purifying Brew removed <strong>{formatNumber(this.totalPurified)}</strong> damage in total over {this.totalPurifies} casts.<br />
            The smallest purify removed <strong>{formatNumber(this.minPurify)}</strong> and the largest purify removed <strong>{formatNumber(this.maxPurify)}</strong>.<br />
            You purified <strong>{this.belowHeavyPurifies}</strong> ({formatPercentage(this.belowHeavyPurifies / this.totalPurifies)}%) times without reaching Heavy Stagger.<br />
            Your purifies were delayed from the nearest peak by <strong>{(this.avgPurifyDelay / 1000).toFixed(2)}s</strong> on average.
          </>
        )}
      />
    );
  }
}

export default PurifyingBrew;
