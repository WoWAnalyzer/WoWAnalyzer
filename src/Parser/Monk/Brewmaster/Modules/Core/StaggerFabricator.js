import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import { GIFT_OF_THE_OX_SPELLS } from '../../Constants';

const PURIFY_BASE = 0.5;
const T20_4PC_PURIFY = 0.05;

export const EVENT_STAGGER_POOL_ADDED = 'addstagger';
export const EVENT_STAGGER_POOL_REMOVED = 'removestagger';

/**
 * Fabricate events corresponding to stagger pool updates. Each stagger
 * tick, purify, and stagger absorb generates one event.
 */
class StaggerFabricator extends Analyzer {
  // causes an orb consumption to clear 5% of stagger
  _hasTier20_4pc = false;
  _staggerPool = 0;

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
    this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_ADDED, event, amount), event);
  }

  removeStagger(event, amount) {
    this._staggerPool -= amount;
    const overage = (this._staggerPool < 0) ? this._staggerPool : 0;
    // sometimes a stagger tick is recorded immediately after death.
    // this ensures we don't go into negative stagger
    //
    // other sources of flat reduction may also hit this condition
    this._staggerPool = Math.max(this._staggerPool, 0);
    this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_REMOVED, event, amount), event);
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
    if (event.ability.guid !== SPELLS.STAGGER_TAKEN.id) {
      return;
    }
    const amount = event.amount + (event.absorbed || 0);
    this.removeStagger(event, amount);
  }

  on_byPlayer_cast(event) {
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

  _fab(type, reason, amount) {
    return {
      timestamp: reason.timestamp,
      type: type,
      amount: amount,
      newPooledDamage: this._staggerPool,
      _reason: reason,
    };
  }
}

export default StaggerFabricator;
