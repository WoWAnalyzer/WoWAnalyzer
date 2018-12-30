import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPELLS from 'common/SPELLS';

import { diminish, ULDIR_K, MPLUS_K } from '../constants/Mitigation';
import { EVENT_STAGGER_POOL_ADDED, EVENT_STAGGER_POOL_REMOVED } from '../core/StaggerFabricator';

export const BASE_AGI = 1468;

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
  };

  K = 0;

  totalAgiStaggered = 0;
  totalAgiPurified = 0;

  _agiDamagePooled = 0;
  _hasHT = false;

  constructor(...args) {
    super(...args);

    this._hasHT = this.selectedCombatant.hasTalent(SPELLS.HIGH_TOLERANCE_TALENT.id);

    const fight = this.owner.fight;
    if(fight.size === 5) {
      this.K = MPLUS_K;
    } else {
      this.K = ULDIR_K[fight.difficulty];
    };

    this.addEventListener(EVENT_STAGGER_POOL_ADDED, this._onStaggerGained);
    this.addEventListener(EVENT_STAGGER_POOL_REMOVED, this._onPurify);
    this.addEventListener(EVENT_STAGGER_POOL_REMOVED, this._onStaggerTick);
    this.addEventListener(Events.death.by(SELECTED_PLAYER), this._onDeath);
  }

  get _hasIsb() {
    return this.selectedCombatant.hasBuff(SPELLS.IRONSKIN_BREW_BUFF.id);
  }

  _onDeath(event) {
    this._agiDamagePooled = 0;
  }

  _onPurify(event) {
    if(event.trigger.type !== 'death' && event.trigger.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      return;
    }

    const amount = Math.min(this._agiDamagePooled, event.amount);
    this._agiDamagePooled -= amount;
    this.totalAgiPurified += amount;
  }

  _onStaggerTick(event) {
    if(event.trigger.type !== 'death' && event.trigger.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      return;
    }

    this._agiDamagePooled = Math.max(this._agiDamagePooled - event.amount, 0);
  }

  _onStaggerGained(event) {
    const baseStagger = staggerPct(BASE_AGI, this.K, this._hasIsb, this._hasHT);
    const agiStagger = staggerPct(this.stats.currentAgilityRating, this.K, this._hasIsb, this._hasHT);
    const amountAgiStaggered = (1 - baseStagger / agiStagger) * event.amount;

    this.totalAgiStaggered += amountAgiStaggered;
    this._agiDamagePooled += amountAgiStaggered;
  }
}
