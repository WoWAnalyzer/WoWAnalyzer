import SPELLS from 'common/SPELLS';
import { EventType, CastEvent, AnyEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const DIVINE_HAMMER_COOLDOWN_MS = 120000;

// Pressing Divine Hammer fires multiple Cast Success events which messes with the cooldown graph (or what it depends on)
// This Normalizer basically marks any "fake" casts as Free Cast
class DivineHammerNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    let lastGenuineCast: CastEvent | null = null;

    events.forEach((event) => {
      if (event.type === EventType.Cast && event.ability.guid === SPELLS.DIVINE_HAMMER_CAST.id) {
        if (isFakeCast(event, lastGenuineCast)) {
          const fabricatedEvent: AnyEvent = {
            ...event,
            type: EventType.FreeCast,
            __modified: true,
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
  if (!lastGenuineCast) {
    return false;
  }

  const nextPossibleCastTimestamp = lastGenuineCast.timestamp + DIVINE_HAMMER_COOLDOWN_MS;

  return event.timestamp < nextPossibleCastTimestamp;
};

export default DivineHammerNormalizer;
