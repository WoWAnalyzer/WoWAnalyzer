import SPELLS from 'common/SPELLS';

import EventsNormalizer from 'parser/core/EventsNormalizer';

class ArcanePowerNormalizer extends EventsNormalizer {

  //Ensures that the apply buff event for Arcane Power is sorted after the Arcane Power cast.

  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === 'cast' && event.ability.guid === SPELLS.ARCANE_POWER.id) {
        const castTimestamp = event.timestamp;

        for (let previousEventIndex = eventIndex; previousEventIndex >= 0; previousEventIndex -= 1) {
          const previousEvent = fixedEvents[previousEventIndex];
          if ((castTimestamp - previousEvent.timestamp) > 50) {
            break;
          }
          if (previousEvent.type === 'applybuff' && previousEvent.ability.guid === SPELLS.ARCANE_POWER.id && previousEvent.sourceID === event.sourceID) {
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

export default ArcanePowerNormalizer;
