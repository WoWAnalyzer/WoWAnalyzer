import React from 'react';

import { formatNumber } from 'common/format';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Events, { EventType, RemoveDebuffEvent, CastEvent } from 'parser/core/Events';
import EventFilter from 'parser/core/EventFilter';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatisticBox from 'interface/others/StatisticBox';
import FooterChart, { formatTime } from 'interface/others/FooterChart';
import { i18n } from '@lingui/core';
import { t } from '@lingui/macro';

import SharedBrews from '../core/SharedBrews';
import BrewCDR from '../core/BrewCDR';
import { AddStaggerEvent, RemoveStaggerEvent } from '../core/StaggerFabricator';

const PURIFY_DELAY_THRESHOLD = 750; // with the removal of ISB, i'm cutting the delay threshold.

function markupPurify(event: CastEvent, delay: number, hasHeavyStagger: boolean) {
  const msgs = [];
  if(delay > PURIFY_DELAY_THRESHOLD) {
    msgs.push(<li key="PURIFY_DELAY_THRESHOLD">You delayed casting it for <b>{(delay / 1000).toFixed(2)}s</b> after being hit, allowing Stagger to tick down.</li>);
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
  };

  protected brews!: SharedBrews;
  protected spells!: SpellUsable;
  protected abilities!: Abilities;
  protected cdr!: BrewCDR;

  purifies: RemoveStaggerEvent[] = [];
  purifyDelays: number[] = [];

  heavyPurifies = 0;

  // used to track heavy stagger for when the debuff drops just before the
  // cast event happens
  _heavyStaggerDropped = false;

  _lastHit?: AddStaggerEvent | RemoveStaggerEvent;
  _msTilPurify = 0;

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.removedebuff.to(SELECTED_PLAYER).spell(SPELLS.HEAVY_STAGGER_DEBUFF), this._removeHeavyStagger);
    this.addEventListener(new EventFilter(EventType.AddStagger), this._addstagger);
    this.addEventListener(new EventFilter(EventType.RemoveStagger), this._removestagger);
  }

  private _removeHeavyStagger(event: RemoveDebuffEvent) {
    if (event.ability.guid === SPELLS.HEAVY_STAGGER_DEBUFF.id) {
      this._heavyStaggerDropped = true;
    }
  }

  get meanPurify() {
    if (this.purifies.length === 0) {
      return 0;
    }

    return this.totalPurified / this.totalPurifies;
  }

  get minPurify() {
    if (this.purifies.length === 0) {
      return 0;
    }

    return this.purifies.reduce((prev, cur) => (prev < cur.amount) ? prev : cur.amount, Infinity);
  }

  get maxPurify() {
    return this.purifies.reduce((prev, cur) => (prev > cur.amount) ? prev : cur.amount, 0);
  }

  get totalPurified() {
    return this.purifies.reduce((prev, cur) => prev + cur.amount, 0);
  }

  get totalPurifies() {
    return this.purifies.length;
  }

  get avgPurifyDelay() {
    if(this.purifyDelays.length === 0) {
      return 0;
    }
    return this.purifyDelays.reduce((total, delay) => total + delay) / this.purifyDelays.length;
  }

  private _addstagger(event: AddStaggerEvent) {
    this._lastHit = event;
    this._msTilPurify = this.spells.isAvailable(SPELLS.PURIFYING_BREW.id) ? 0 : this.spells.cooldownRemaining(SPELLS.PURIFYING_BREW.id);
  }

  private _removestagger(event: RemoveStaggerEvent) {
    if(this._lastHit === undefined) {
      if(event.amount > 0) {
        console.warn('Stagger removed but player hasn\'t been hit yet', event);
      }
      return; // no hit yet
    }
    // tracking gap from peak --- ideally you want to purify as close to
    // a peak as possible, but if no purify charges are available we
    // want to get the new pooled amount
    const gap = event.timestamp - this._lastHit!.timestamp;
    if(event.trigger!.ability && event.trigger!.ability.guid === SPELLS.STAGGER.id && this._msTilPurify - gap > 0) {
      this._msTilPurify = Math.max(0, this._msTilPurify - gap);
      this._lastHit = event;
    }

    // tracking purification
    if (!event.trigger!.ability || event.trigger!.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      // reset this, if we lost heavy stagger then death or another ability took us out of heavy stagger
      this._heavyStaggerDropped = false;
      return;
    }
    this.purifies.push(event);
    const delay = event.timestamp - this._lastHit.timestamp - this._msTilPurify;
    this.purifyDelays.push(delay);
    const hasHeavyStagger = this.selectedCombatant.hasBuff(SPELLS.HEAVY_STAGGER_DEBUFF.id) || this._heavyStaggerDropped;
    const trigger = event.trigger!;

    if (trigger.type === EventType.Cast) {
      markupPurify(trigger, delay, hasHeavyStagger);
    }
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
      style: ThresholdStyle.SECONDS,
    };
  }

  suggestions(when: When) {
    when(this.purifyDelaySuggestion).addSuggestion((suggest, actual, recommended) => suggest(<>You should delay your <SpellLink id={SPELLS.PURIFYING_BREW.id} /> cast as little as possible after being hit to maximize its effectiveness.</>)
        .icon(SPELLS.PURIFYING_BREW.icon)
        .actual(i18n._(t('monk.brewmaster.suggestions.purifyingBrew.avgdelay')`${actual.toFixed(2)}s Average Delay`))
        .recommended(`< ${recommended.toFixed(2)}s is recommended`));
  }

  statistic() {
    const spec = {
      mark: 'bar',
      transform: [
        { calculate: `datum.timestamp - ${this.owner.fight.start_time}` , as: 'timestamp' },
        { calculate: "datum.timestamp / 60000", as: 'time_min' },
        { calculate: formatTime(), as: 'time_label' },
      ],
      encoding: {
        x: {
          field: 'time_min',
          type: 'quantitative' as const,
          axis: {
            labelExpr: formatTime('(datum.value * 60000)'),
            grid: false,
          },
          title: null,
          scale: { zero: true },
        },
        y: {
          field: 'amount',
          type: 'quantitative' as const,
          title: null,
          axis: {
            grid: false,
            format: '~s',
          },
        },
        tooltip: [
          { field: 'time_label', type: 'nominal' as const, title: 'Time' },
          { field: 'amount', type: 'quantitative' as const, title: 'Amount Purified', format: '.3~s' },
        ],
      },
    };

    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.PURIFYING_BREW.id} />}
        value={formatNumber(this.meanPurify)}
        label="Avg. Mitigation per Purifying Brew"
        tooltip={(
          <>
            Purifying Brew removed <strong>{formatNumber(this.totalPurified)}</strong> damage in total over {this.totalPurifies} casts.<br />
            The smallest purify removed <strong>{formatNumber(this.minPurify)}</strong> and the largest purify removed <strong>{formatNumber(this.maxPurify)}</strong>.<br />
            Your purifies were delayed from the nearest peak by <strong>{(this.avgPurifyDelay / 1000).toFixed(2)}s</strong> on average.
          </>
        )}
        footer={(<FooterChart data={this.purifies} spec={spec} />)}
      />
    );
  }
}

export default PurifyingBrew;
