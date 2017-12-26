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

export const EVENT_STAGGER_POOL_UPDATE = "stagger_pool_update";
export const KIND_STAGGER_ADDED = "added";
export const KIND_STAGGER_REMOVED = "removed";

/**
 * Fabricate events corresponding to stagger pool updates. Each stagger
 * tick, purify, and stagger absorb generates one event.
 */
class StaggerFabricator extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  }

  _has_t20_4pc = false;
  _PURIFY_AMOUNT = PURIFY_BASE;
  _stagger_pool = 0;
  _has_quick_sip = false;

  get staggerPool() {
    return this._stagger_pool;
  }

  on_initialized() {
    const player = this.combatants.selected;
    if(player.hasTalent(SPELLS.ELUSIVE_DANCE_TALENT.id)) {
      this._PURIFY_AMOUNT += ELUSIVE_DANCE_PURIFY;
    }
    this._PURIFY_AMOUNT += player.traitsBySpellId[SPELLS.STAGGERING_AROUND.id] * STAGGERING_AROUND_PURIFY;
    this._has_quick_sip = player.traitsBySpellId[SPELLS.QUICK_SIP.id] > 0;
    this._has_t20_4pc = player.hasBuff(SPELLS.XUENS_BATTLEGEAR_4_PIECE_BUFF_BRM.id);
  }

  on_toPlayer_absorbed(event) {
    if (event.ability.guid === SPELLS.STAGGER.id) {
      if (event.extraAbility.guid === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
        return;
      }
      const amount = event.amount + (event.absorbed || 0);
      this._stagger_pool += amount;
      debug && console.log("triggering stagger pool update due to absorb");
      this.owner.triggerEvent(EVENT_STAGGER_POOL_UPDATE, this._fab(event, amount));
    }
  }

  on_toPlayer_damage(event) {
    if (event.ability.guid === SPELLS.STAGGER_TAKEN.id) {
      const amount = event.amount + (event.absorbed || 0);
      this._stagger_pool -= amount;
      debug && console.log("triggering stagger pool update due to stagger tick");
      this.owner.triggerEvent(EVENT_STAGGER_POOL_UPDATE, this._fab(event, -amount));
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.PURIFYING_BREW.id) {
      const amount = this._stagger_pool * this._PURIFY_AMOUNT;
      this._stagger_pool -= amount;
      debug && console.log("triggering stagger pool update due to purify");
      this.owner.triggerEvent(EVENT_STAGGER_POOL_UPDATE, this._fab(event, -amount));
    } else if (this._has_quick_sip && event.ability.guid === SPELLS.IRONSKIN_BREW.id) {
      const amount = this._stagger_pool * ISB_QUICK_SIP_PURIFY;
      this._stagger_pool -= amount;
      debug && console.log("triggering stagger pool update due to ISB + Quick Sip");
      this.owner.triggerEvent(EVENT_STAGGER_POOL_UPDATE, this._fab(event, -amount));
    }
  }

  on_toPlayer_heal(event) {
    if (this._has_t20_4pc && GIFT_OF_THE_OX_SPELLS.indexOf(event.ability.guid) !== -1) {
      const amount = this._stagger_pool * T20_4PC_PURIFY;
      this._stagger_pool -= amount;
      debug && console.log("triggering stagger pool update due to T20 4pc");
      this.owner.triggerEvent(EVENT_STAGGER_POOL_UPDATE, this._fab(event, -amount));
    }
  }

  _fab(event, amount) {
    return {
      timestamp: event.timestamp,
      type: EVENT_STAGGER_POOL_UPDATE,
      ability: event.ability,
      extraAbility: event.extraAbility,
      kind: amount > 0 ? KIND_STAGGER_ADDED : KIND_STAGGER_REMOVED,
      amount: Math.abs(amount),
      pooled_damage: this._stagger_pool,
      sourceID: event.sourceID,
      targetID: event.targetID,
    };
  }
}

export default StaggerFabricator;
