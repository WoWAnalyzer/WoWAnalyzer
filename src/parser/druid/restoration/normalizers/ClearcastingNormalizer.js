import EventsNormalizer from 'parser/core/EventsNormalizer';

import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';

const MAX_DELAY = 50;

// Clearcasting buff fades before the regrowth cast event that consumed it shows up.
// This swaps the order so the buff always fades AFTER the regrowth cast event.
class ClearcastingNormalizer extends EventsNormalizer {

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast && event.ability.guid === SPELLS.REGROWTH.id) {
        const castTimestamp = event.timestamp;

        // Loop through the event history in reverse to detect if there was a clearcast remove event that was the result of this cast
        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > MAX_DELAY) {
            break;
          }
          if (previousEvent.type === EventType.RemoveBuff && previousEvent.ability.guid === SPELLS.CLEARCASTING_BUFF.id && previousEvent.sourceID === event.sourceID) {
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
export default ClearcastingNormalizer;
