import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';

class OverpowerNormalizer extends EventsNormalizer {

  //Ensures that the apply buff event for Overpower is sorted after the Overpower.

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.OVERPOWER.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if (((castTimestamp - previousEvent.timestamp) > 50) || (!previousEvent.ability.guid === SPELLS.OVERPOWER.id && !previousEvent.sourceID === event.sourceID)) {
            break;
          }

          if (previousEvent.type === 'applybuff' || previousEvent.type === 'applybuffstack') {
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
