import Analyzer from 'Parser/Core/Analyzer';

import SpellUsable from './SpellUsable';
import Abilities from './Abilities';

const GCD_MATCH_BUFFER_MS = 150;
const RESET_BUFFER_PERCENT = 0.5;

class SpellHistory extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  historyBySpellId = {
    // This contains the raw event to have all information one might ever need and so that we don't construct additional objects that take their own memory.
    // [spellId]: [
    //   {type: 'cast', timestamp, ...},
    //   {type: 'updatespellusable', trigger: 'begincooldown', timestamp, ...},
    //   {type: 'applybuff', timestamp, ...},
    //   {type: 'removebuff', timestamp, ...},
    //   {type: 'updatespellusable', trigger: 'endcooldown', timestamp, ...},
    //   ...
    // ]
  };

  lastGlobalCooldown = null;

  _getAbility(spellId) {
    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      // We're only interested in abilities in Abilities since that's the only place we'll show the spell history, besides we only really want to track *casts* and the best source of info for that is Abilities.
      return null;
    }

    const primarySpellUd = ability.primarySpell.id;
    if (!this.historyBySpellId[primarySpellUd]) {
      this.historyBySpellId[primarySpellUd] = [];
    }
    return this.historyBySpellId[primarySpellUd];
  }

  _append(spellId, event) {
    const history = this._getAbility(spellId);
    if (history) {
      history.push(event);
    }
  }

  _addTimeWaitingOnGCD(event) {
    if (!this.lastGlobalCooldown) {
      return event;
    }
    const resetBufferMS = RESET_BUFFER_PERCENT * this.lastGlobalCooldown.duration;
    const earlyByMS = event.start + event.expectedDuration - event.timestamp;
    // check if the ability was reset early. If the reset was less than a percentage of the GCD don't consider it as a reset.
    // check if the reset happened as a result of the previous cast
    if (event.trigger === 'endcooldown' && resetBufferMS < earlyByMS 
    && event.timestamp < this.lastGlobalCooldown.timestamp + GCD_MATCH_BUFFER_MS) {
      // if the time remaining was less than the GCD use that instead
      event.timeWaitingOnGCD = Math.min(earlyByMS, this.lastGlobalCooldown.duration);
    }
    return event;
  }

  on_byPlayer_begincast(event) {
    const spellId = event.ability.guid;
    this._append(spellId, event);
  }
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    this._append(spellId, event);
  }
  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    this._append(spellId, event);
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    this._append(spellId, event);
  }
  on_toPlayer_updatespellusable(event) {
    const spellId = event.ability.guid;
    this._append(spellId, this._addTimeWaitingOnGCD(event));
  }
  on_byPlayer_globalcooldown(event) {
    this.lastGlobalCooldown = event;
  }
}

export default SpellHistory;
