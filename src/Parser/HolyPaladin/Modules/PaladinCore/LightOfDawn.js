import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class LightOfDawn extends Module {
  /**
   * when you cast Light of Dawn and you yourself are one of the targets the heal event will be in the events log before the cast event. This can make parsing certain things rather hard, so we need to swap them around.
   * @param {Array} events
   * @returns {Array}
   */
  reorderEvents(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.LIGHT_OF_DAWN_CAST.id) {
        const castTimestamp = event.timestamp;

        // Loop through the event history in reverse to detect if there was a `heal` event on the same player that was the result of this cast and thus misordered
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) { // the max delay between the heal and cast events never looks to be more than this.
            break;
          }
          if (previousEvent.type === 'heal' && previousEvent.ability.guid === SPELLS.LIGHT_OF_DAWN_HEAL.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break; // I haven't seen a log with multiple `heal` events before the `cast` yet
          }
        }
      }
    });

    return fixedEvents;
  }

  _lightOfDawnHealIndex = 0;
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_CAST.id) {
      return;
    }

    this._lightOfDawnHealIndex = 0;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.LIGHT_OF_DAWN_HEAL.id) {
      return;
    }

    event.lightOfDawnHealIndex = this._lightOfDawnHealIndex;
    this._lightOfDawnHealIndex += 1;
  }
}

export default LightOfDawn;
