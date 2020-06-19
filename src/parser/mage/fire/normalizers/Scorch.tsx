import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

class Scorch extends EventsNormalizer {
  /**
   * @param {Array} events
   * @returns {Array}
   */
  //Because Scorch has no travel time, ensures that the Scorch Damage event happens after Hot Streak is removed so the Scorch doesnt count as a direct damage crit during Hot Streak
  normalize(events: any) {
    const fixedEvents: any = [];
    events.forEach((event: any, eventIndex: any) => {
      fixedEvents.push(event);

      if (event.type === EventType.RemoveBuff && event.ability.guid === SPELLS.HOT_STREAK.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) {
            break;
          }
          if (previousEvent.type === EventType.Damage && previousEvent.ability.guid === SPELLS.SCORCH.id && previousEvent.sourceID === event.sourceID) {
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

export default Scorch;
