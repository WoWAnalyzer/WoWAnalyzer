import SPELLS from 'common/SPELLS';
import { EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const CAST_WINDOW = 100;

/**
 * During the opener garrote casts seems to sometimes appear after the damage and energize event, as well as stealth being removed.
 * Moving the cast even to just before the damage event should ensure that we are able to correctly track if the cast happened during stealth.
 *
 * @param {Array} events
 * @returns {Array} Events possibly with some reordered.
 */
class GarroteNormalizer extends EventsNormalizer {
  normalize(events) {
    const fixedEvents = [];
    events.forEach((event, eventIndex) => {
      fixedEvents.push(event);

      if (event.type === EventType.Cast && event.ability.guid === SPELLS.GARROTE.id) {
        const castTimestamp = event.timestamp;

        for (
          let previousEventIndex = eventIndex;
          previousEventIndex >= 0;
          previousEventIndex -= 1
        ) {
          const previousEvent = fixedEvents[previousEventIndex];
          if (castTimestamp - previousEvent.timestamp > CAST_WINDOW) {
            break;
          }
          if (
            previousEvent.type === EventType.ResourceChange &&
            previousEvent.ability.guid === SPELLS.GARROTE.id
          ) {
            event.timestamp = previousEvent.timestamp;
            fixedEvents.splice(eventIndex, 1);
            fixedEvents.splice(previousEventIndex, 0, event);
            event.__reordered = true;
            break;
          }
        }
      }
    });

    return fixedEvents;
  }
}

export default GarroteNormalizer;
