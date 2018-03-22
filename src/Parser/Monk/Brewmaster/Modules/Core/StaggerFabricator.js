import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import { GIFT_OF_THE_OX_SPELLS } from '../../Constants';

const PURIFY_BASE = 0.4;
const ELUSIVE_DANCE_PURIFY = 0.2;
const STAGGERING_AROUND_PURIFY = 0.01;
const ISB_QUICK_SIP_PURIFY = 0.05;
const T20_4PC_PURIFY = 0.05;
const debug = false;

export const EVENT_STAGGER_POOL_ADDED = 'addstagger';
export const EVENT_STAGGER_POOL_REMOVED = 'removestagger';

/**
 * Fabricate events corresponding to stagger pool updates. Each stagger
 * tick, purify, and stagger absorb generates one event.
 */
class StaggerFabricator extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // causes an orb consumption to clear 5% of stagger
  _hasTier20_4pc = false;
  // causes ISB to clear 5% of stagger, and PB to increase ISB duration
  // by 1s
  _hasQuickSipTrait = false;
  _staggerPool = 0;

  get purifyPercentage() {
    const player = this.combatants.selected;
    let pct = PURIFY_BASE;
    if (player.hasTalent(SPELLS.ELUSIVE_DANCE_TALENT.id)) {
      // elusive dance clears an extra 20% of staggered damage
      pct += ELUSIVE_DANCE_PURIFY;
    }
    // staggering around (trait) adds an extra 1% per rank
    pct += STAGGERING_AROUND_PURIFY * player.traitsBySpellId[SPELLS.STAGGERING_AROUND.id];
    return pct;
  }

  get staggerPool() {
    return this._staggerPool;
  }

  on_initialized() {
    const player = this.combatants.selected;
    this._hasQuickSipTrait = player.traitsBySpellId[SPELLS.QUICK_SIP.id] > 0;
    this._hasTier20_4pc = player.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id);
  }

  on_toPlayer_absorbed(event) {
    if (event.ability.guid !== SPELLS.STAGGER.id) {
      return;
    }
    if (event.extraAbility.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
      return;
    }
    const amount = event.amount + (event.absorbed || 0);
    this._staggerPool += amount;
    debug && console.log("triggering stagger pool update due to absorb");
    this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_ADDED, event, amount), event);
  }

  on_toPlayer_damage(event) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      const amount = event.amount + (event.absorbed || 0);
      this._staggerPool -= amount;
      // sometimes a stagger tick is recorded immediately after death.
      // this ensures we don't go into negative stagger
      this._staggerPool = Math.max(this._staggerPool, 0);
      debug && console.log("triggering stagger pool update due to stagger tick");
      this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_REMOVED, event, amount), event);
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.PURIFYING_BREW.id) {
      const amount = this._staggerPool * this.purifyPercentage;
      this._staggerPool -= amount;
      debug && console.log("triggering stagger pool update due to purify");
      this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_REMOVED, event, amount), event);
    } else if (this._hasQuickSipTrait && event.ability.guid === SPELLS.IRONSKIN_BREW.id) {
      const amount = this._staggerPool * ISB_QUICK_SIP_PURIFY;
      this._staggerPool -= amount;
      debug && console.log("triggering stagger pool update due to ISB + Quick Sip trait");
      this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_REMOVED, event, amount), event);
    }
  }

  on_toPlayer_heal(event) {
    if (!this._hasTier20_4pc || !GIFT_OF_THE_OX_SPELLS.includes(event.ability.guid)) {
      return;
    }
    const amount = this._staggerPool * T20_4PC_PURIFY;
    this._staggerPool -= amount;
    debug && console.log("triggering stagger pool update due to T20 4pc");
    this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_REMOVED, event, amount), event);
  }

  on_toPlayer_death(event) {
    const amount = this._staggerPool;
    this._staggerPool = 0;
    this.owner.fabricateEvent(this._fab(EVENT_STAGGER_POOL_REMOVED, event, amount), event);
  }

  _fab(type, reason, amount) {
    return {
      timestamp: reason.timestamp,
      type: type,
      amount: amount,
      newPooledDamage: this._staggerPool,
    };
  }
}

export default StaggerFabricator;
