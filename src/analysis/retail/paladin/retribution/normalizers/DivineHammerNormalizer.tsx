import SPELLS from 'common/SPELLS';
import { EventType, CastEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const DIVINE_HAMMER_COOLDOWN_MS = 120000;

class DivineHammerNormalizer extends EventsNormalizer {
  normalize(events: any[]): any[] {
    const fixedEvents: any[] = [];
    let lastGenuineCast: CastEvent | null = null;

    events.forEach((event) => {
      if (event.type === EventType.Cast && event.ability.guid === SPELLS.DIVINE_HAMMER_CAST.id) {
        if (isFakeCast(event, lastGenuineCast)) {
          const fabricatedEvent = {
            ...event,
            type: EventType.FreeCast,
            _fabricated: true,
          };

          fixedEvents.push(fabricatedEvent);
        } else {
          fixedEvents.push(event);
          lastGenuineCast = event;
        }
      } else {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

const isFakeCast = (event: CastEvent, lastGenuineCast: CastEvent | null): boolean => {
  let fakeCast = false;

  if (!lastGenuineCast) {
    return fakeCast;
  }

  const nextPossibleCastTimestamp = lastGenuineCast.timestamp + DIVINE_HAMMER_COOLDOWN_MS;

  if (event.timestamp < nextPossibleCastTimestamp) {
    fakeCast = true;
  }

  return fakeCast;
};

export default DivineHammerNormalizer;
