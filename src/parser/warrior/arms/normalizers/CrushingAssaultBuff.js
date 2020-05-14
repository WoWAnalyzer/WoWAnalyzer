import SPELLS from 'common/SPELLS';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EventType } from 'parser/core/Events';

class CrushingAssaultNormalizer extends EventsNormalizer {

  // Ensures that the remove buff event for Crushing Assault is sorted after the Slam damage.
  // Needed to calculate Crushing Assault damage.
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === EventType.Damage && event.ability.guid === SPELLS.SLAM.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if (((castTimestamp - previousEvent.timestamp) > 50) || (previousEvent.ability && previousEvent.ability.guid !== SPELLS.CRUSHING_ASSAULT_BUFF.id && previousEvent.sourceID !== event.sourceID)) {
            break;
          }

          if (previousEvent.type === EventType.RemoveBuff) {
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

export default CrushingAssaultNormalizer;
