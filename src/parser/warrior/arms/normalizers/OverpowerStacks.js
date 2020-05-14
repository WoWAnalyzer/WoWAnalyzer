import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

class OverpowerNormalizer extends EventsNormalizer {

  //Ensures that the apply buff event for Overpower is sorted after the Overpower.
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast && event.ability.guid === SPELLS.OVERPOWER.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if (((castTimestamp - previousEvent.timestamp) > 50) || (!previousEvent.ability.guid === SPELLS.OVERPOWER.id && !previousEvent.sourceID === event.sourceID)) {
            break;
          }

          if (previousEvent.type === EventType.ApplyBuff || previousEvent.type === EventType.ApplyBuffStack) {
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

export default OverpowerNormalizer;
