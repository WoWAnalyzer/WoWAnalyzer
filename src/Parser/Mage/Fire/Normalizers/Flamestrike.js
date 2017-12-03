import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'Parser/Core/EventsNormalizer';

class Flamestrike extends EventsNormalizer {
  /**
   * Divine Purpose procs sometimes are logged before the related cast. This makes dealing with it harder, so reorder it.
   * @param {Array} events
   * @returns {Array}
   */
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.FLAMESTRIKE.id) {
        const castTimestamp = event.timestamp;

        // Loop through the event history in reverse to detect if there was a `applybuff` event on the same player that was the result of this cast and thus misordered
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) { // the max delay between the heal and cast events never looks to be more than this.
            break;
          }
          if (previousEvent.type === 'removebuff' && previousEvent.ability.guid === SPELLS.HOT_STREAK.id && previousEvent.sourceID === event.sourceID) {
            fixedEvents.splice(previousEventIndex, 1);
            fixedEvents.push(previousEvent);
            previousEvent.__modified = true;
            break;
          }
        }
      }
    });

    return fixedEvents;
  }
}

export default Flamestrike;
