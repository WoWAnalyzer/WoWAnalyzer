import React from 'react';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import STAT, { getClassNameColor, getName } from 'parser/shared/modules/features/STAT';
import Events, { EventType } from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import { TooltipElement } from 'common/Tooltip';

import { BASE_AGI } from '../../constants';
import { diminish, lookupK } from '../constants/Mitigation';
import { EVENT_STAGGER_POOL_ADDED, EVENT_STAGGER_POOL_REMOVED } from '../core/StaggerFabricator';
import GiftOfTheOx from '../spells/GiftOfTheOx';
import MasteryValue from '../core/MasteryValue';
import MitigationSheet, { makeIcon } from './MitigationSheet';
import Stagger from '../core/Stagger';

const STAGGER_COEFFS = {
  base: 1.05,
  isb: 3.7,
  ht: 1.4,
};

export function staggerPct(agi, K, hasIsb, hasHT) {
  const rating = agi * STAGGER_COEFFS.base * (hasIsb ? STAGGER_COEFFS.isb : 1) * (hasHT ? STAGGER_COEFFS.ht : 1);
  return diminish(rating, K);
}

/**
 * Calculates the amount of damage staggered & purified due to agility.
 *
 * Method:
 *
 * 1. Each time damage is staggered, calculate the amount of damage that
 * was staggered due to agility. Add this to a pool.
 * 2. Each time damage is removed from stagger, if the agility pool is
 * non-empty, remove it from the agility pool.
 * 2.a. If the damage is not removed by the stagger dot, add the removed
 * amount to the total value of agility->stagger.
 */
export default class AgilityValue extends Analyzer {
  static dependencies = {
    stats: StatTracker,
    gotox: GiftOfTheOx,
    masteryValue: MasteryValue,
    sheet: MitigationSheet,
    stagger: Stagger,
  };

  get K() {
    return lookupK(this.owner.fight);
  }

  totalAgiStaggered = 0;
  totalAgiPurified = 0;

  get totalAgiHealing() {
    return this.gotox.agiBonusHealing;
  }
  _agiDamagePooled = 0;
  hasHT = false;

  constructor(...args) {
    super(...args);

    this.hasHT = this.selectedCombatant.hasTalent(SPELLS.HIGH_TOLERANCE_TALENT.id);

    this.addEventListener(EVENT_STAGGER_POOL_ADDED, this._onStaggerGained);
    this.addEventListener(EVENT_STAGGER_POOL_REMOVED, this._onPurify);
    this.addEventListener(EVENT_STAGGER_POOL_REMOVED, this._onStaggerTick);
    this.addEventListener(Events.death.by(SELECTED_PLAYER), this._onDeath);

    this.sheet.registerStat(STAT.AGILITY, this.statValue());
  }

  get _hasIsb() {
    return this.selectedCombatant.hasBuff(SPELLS.IRONSKIN_BREW_BUFF.id);
  }

  _onDeath(event) {
    this._agiDamagePooled = 0;
  }

  _onPurify(event) {
    if(event.trigger.type !== EventType.Death && event.trigger.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }

    const amount = Math.min(this._agiDamagePooled, event.amount);
    this._agiDamagePooled -= amount;
    this.totalAgiPurified += amount;
  }

  _onStaggerTick(event) {
    if(event.trigger.type !== EventType.Death && event.trigger.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      return;
    }

    this._agiDamagePooled = Math.max(this._agiDamagePooled - event.amount, 0);
  }

  _onStaggerGained(event) {
    const baseStagger = staggerPct(BASE_AGI, this.K, this._hasIsb, this.hasHT);
    const agiStagger = staggerPct(this.stats.currentAgilityRating, this.K, this._hasIsb, this.hasHT);
    const amountAgiStaggered = (1 - baseStagger / agiStagger) * event.amount;

    this.totalAgiStaggered += amountAgiStaggered;
    this._agiDamagePooled += amountAgiStaggered;
  }

  get agiDamageDodged() {
    return this.masteryValue.expectedMitigation - this.masteryValue.noAgiExpectedDamageMitigated;
  }

  statValue() {
    const agiModule = this;
    return {
      priority: 2,
      icon: makeIcon(STAT.AGILITY),
      name: getName(STAT.AGILITY),
      className: getClassNameColor(STAT.AGILITY),
      statName: STAT.AGILITY,
      get gain() {
        return [
          { name: <><SpellLink id={SPELLS.GIFT_OF_THE_OX_1.id} /> Healing</>, amount: agiModule.totalAgiHealing },
          {
            name: <TooltipElement content="The amount of damage avoided by dodging may be reduced by purification. This is reflected in the range of values.">Dodge</TooltipElement>,
            amount: {
              low: agiModule.agiDamageDodged * (1 - agiModule.stagger.pctPurified),
              high: agiModule.agiDamageDodged,
            },
            isLoaded: agiModule.masteryValue._loaded,
          },
          { name: <>Extra <SpellLink id={SPELLS.PURIFYING_BREW.id} /> Effectiveness</>, amount: agiModule.totalAgiPurified },
        ];
      },
    };
  }
}
