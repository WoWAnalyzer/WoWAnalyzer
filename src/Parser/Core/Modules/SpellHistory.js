import Analyzer from 'Parser/Core/Analyzer';

import SpellUsable from './SpellUsable';
import Abilities from './Abilities';

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

  _getAbility(spellId) {
    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      // We're only interested in abilities in Abilities since that's the only place we'll show the spell history, besides we only really want to track *casts* and the best source of info for that is Abilities.
      return null;
    }
    const mainSpellId = ability.spell.id;
    if (!this.historyBySpellId[mainSpellId]) {
      this.historyBySpellId[mainSpellId] = [];
    }
    return this.historyBySpellId[mainSpellId];
  }

  _append(spellId, event) {
    const history = this._getAbility(spellId);
    if (history) {
      history.push(event);
    }
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
    this._append(event.spellId, event);
  }
}

export default SpellHistory;
