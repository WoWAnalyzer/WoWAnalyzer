import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'parser/core/EventsNormalizer';

/**
 * For some reason Garrote refreshes sometimes have a removebuff and applybuff event when it should have a refreshbuff event.
 * 
 * @param {Array} events
 * @returns {Array} Events possibly with some reordered.
 */
class GarroteNormalizer extends EventsNormalizer {

  normalize(events) {
    const fixedEvents = [];
    let eventsRemoved = 0;
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      // find an applybuff event for Garrote
      if(event.type === 'applydebuff' && event.ability.guid === SPELLS.GARROTE.id) {

        // look for matching removebuff
        for (let previousEventIndex = (eventIndex - eventsRemoved); previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if (event.timestamp > previousEvent.timestamp) {
            break;
          }
          if (previousEvent.type === 'removedebuff' &&
              previousEvent.ability.guid === SPELLS.GARROTE.id) {
            event.type = 'refreshdebuff';
            event.__modified = true;
            fixedEvents.splice(previousEventIndex, 1);
            eventsRemoved += 1;
            break;
          }
        }
      }
    });
    
    return fixedEvents;
  }
}

export default GarroteNormalizer;
