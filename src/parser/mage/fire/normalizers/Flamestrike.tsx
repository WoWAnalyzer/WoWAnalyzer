import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

class Flamestrike extends EventsNormalizer {
  /**
   * @param {Array} events
   * @returns {Array}
   */
  normalize(events: any) {
    const fixedEvents: any = [];
    events.forEach((event: any, eventIndex: any) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast && event.ability.guid === SPELLS.FLAMESTRIKE.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) {
            break;
          }
          if (previousEvent.type === EventType.RemoveBuff && previousEvent.ability.guid === SPELLS.HOT_STREAK.id && previousEvent.sourceID === event.sourceID) {
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
