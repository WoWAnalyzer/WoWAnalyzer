import Analyzer from 'Parser/Core/Analyzer';
import Abilities from './Abilities';

class TimelineBuffEvents extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };

  buffHistoryBySpellId = {};

  _getAbility(spellId) {
    // checking if there is any ability that cares about this buff
    const ability = this.abilities.getSpellBuffId(spellId);
    if (!ability) {
      return null;
    }

    if (!this.buffHistoryBySpellId[spellId]) {
      this.buffHistoryBySpellId[spellId] = [];
    }
    return this.buffHistoryBySpellId[spellId];
  }

  _append(spellId, event) {
    const history = this._getAbility(spellId);
    if (history) {
      history.push(event);
    }
  }
  
  on_toPlayer_changebuffstack(event) {
    const spellId = event.ability.guid;
    this._append(spellId, event);
  }

  on_byPlayer_changedebuffstack(event) {
    const spellId = event.ability.guid;
    this._append(spellId, event);
  }

  on_finished() {
    // check if there are buffs which are still active on fight end, and add an end event
    Object.keys(this.buffHistoryBySpellId)
    .forEach((spellId) => {
      const event = this.buffHistoryBySpellId[spellId][this.buffHistoryBySpellId[spellId].length -1];
      if (event.end === null) {
        this.buffHistoryBySpellId[spellId].push({
          ...event,
          end: this.owner.fight.end_time,
          timestamp: this.owner.fight.end_time + 500, // add 500ms so it doesn't have a gap at the end of the timeline
        });
      }
    });
  }
}

export default TimelineBuffEvents;
