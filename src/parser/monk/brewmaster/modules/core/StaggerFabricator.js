import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';
import Haste from 'parser/shared/modules/Haste';
import { GIFT_OF_THE_OX_SPELLS } from '../../constants';
import HighTolerance, { HIGH_TOLERANCE_HASTE } from '../spells/HighTolerance';

const PURIFY_BASE = 0.5;
const T20_4PC_PURIFY = 0.05;

export const EVENT_STAGGER_POOL_ADDED = 'addstagger';
export const EVENT_STAGGER_POOL_REMOVED = 'removestagger';

const STAGGER_THRESHOLDS = {
  HEAVY: 0.6,
  MODERATE: 0.3,
  LIGHT: 0.0,
};

/**
 * Fabricate events corresponding to stagger pool updates. Each stagger
 * tick, purify, and stagger absorb generates one event.
 */
class StaggerFabricator extends Analyzer {
  // causes an orb consumption to clear 5% of stagger
  _hasTier20_4pc = false;
  _staggerPool = 0;
  _lastKnownMaxHp = 0;

  static dependencies = {
    ht: HighTolerance,
    haste: Haste,
  };

  constructor(...args) {
    super(...args);
    this._hasTier20_4pc = this.selectedCombatant.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id);
  }

  get purifyPercentage() {
    return PURIFY_BASE;
  }

  get staggerPool() {
    return this._staggerPool;
  }

  addStagger(event, amount) {
    this._staggerPool += amount;
    const staggerEvent = this._fab(EVENT_STAGGER_POOL_ADDED, event, amount);
    this.owner.fabricateEvent(staggerEvent, event);
    if(this.ht && this.ht.active) {
      this._updateHaste(event, staggerEvent);
    }
  }

  removeStagger(event, amount) {
    this._staggerPool -= amount;
    const overage = (this._staggerPool < 0) ? this._staggerPool : 0;
    // sometimes a stagger tick is recorded immediately after death.
    // this ensures we don't go into negative stagger
    //
    // other sources of flat reduction may also hit this condition
    this._staggerPool = Math.max(this._staggerPool, 0);
    const staggerEvent = this._fab(EVENT_STAGGER_POOL_REMOVED, event, amount, overage);
    this.owner.fabricateEvent(staggerEvent, event);
    if(this.ht && this.ht.active) {
      this._updateHaste(event, staggerEvent);
    }
    return amount + overage;
  }

  on_toPlayer_absorbed(event) {
    if (event.ability.guid !== SPELLS.STAGGER.id) {
      return;
    }
    if (event.extraAbility && event.extraAbility.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
      return;
    }
    const amount = event.amount + (event.absorbed || 0);
    this.addStagger(event, amount);
  }

  on_toPlayer_damage(event) {
    // used for buff tracking
    this._lastKnownMaxHp = event.maxHitPoints;

    if (event.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    const amount = event.amount + (event.absorbed || 0);
    this.removeStagger(event, amount);
  }

  on_byPlayer_cast(event) {
    // used for buff tracking
    this._lastKnownMaxHp = event.maxHitPoints;

    if (event.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      return;
    }
    const amount = this._staggerPool * this.purifyPercentage;
    this.removeStagger(event, amount);
  }

  on_toPlayer_death(event) {
    const amount = this._staggerPool;
    this.removeStagger(event, amount);
  }

  on_toPlayer_heal(event) {
    if (!this._hasTier20_4pc || !GIFT_OF_THE_OX_SPELLS.includes(event.ability.guid)) {
      return;
    }
    const amount = this._staggerPool * T20_4PC_PURIFY;
    this.removeStagger(event, amount);
  }

  _fab(type, reason, amount, overage = 0) {
    return {
      timestamp: reason.timestamp,
      type: type,
      amount: amount + overage,
      overheal: -overage,
      newPooledDamage: this._staggerPool,
      _reason: reason,
    };
  }

  _previousBuff = null;
  _updateHaste(sourceEvent, staggerEvent) {
    let currentBuff;
    const staggerRatio = staggerEvent.newPooledDamage / (sourceEvent.maxHitPoints || this._lastKnownMaxHp);
    if(staggerRatio === 0) {
      currentBuff = null;
    } else if(staggerRatio < STAGGER_THRESHOLDS.MODERATE) {
      currentBuff = SPELLS.LIGHT_STAGGER_DEBUFF.id;
    } else if(staggerRatio < STAGGER_THRESHOLDS.HEAVY) {
      currentBuff = SPELLS.MODERATE_STAGGER_DEBUFF.id;
    } else {
      currentBuff = SPELLS.HEAVY_STAGGER_DEBUFF.id;
    }

    if(currentBuff !== this._previousBuff) {
      this._previousBuff && this.haste._applyHasteLoss(staggerEvent, HIGH_TOLERANCE_HASTE[this._previousBuff]);
      currentBuff && this.haste._applyHasteGain(staggerEvent, HIGH_TOLERANCE_HASTE[currentBuff]);
      this._previousBuff = currentBuff;
    }
  }
}

export default StaggerFabricator;
