import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';
import { Event, EventType, ApplyBuffEvent, CastEvent } from 'parser/core/Events';

class Combustion extends EventsNormalizer {
  /**
   * @param {Array} events
   * @returns {Array}
   */
  normalize(events: Event<any>[]) {
    const fixedEvents: Event<any>[] = [];
    events.forEach((event: Event<any>, eventIndex: number) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast && (event as CastEvent).ability.guid === SPELLS.COMBUSTION.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) {
            break;
          }
          if (previousEvent.type === EventType.ApplyBuff && (previousEvent as ApplyBuffEvent).ability.guid === SPELLS.COMBUSTION.id && (previousEvent as ApplyBuffEvent).sourceID === (event as CastEvent).sourceID) {
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

export default Combustion;
