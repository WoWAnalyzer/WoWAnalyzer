import EventsNormalizer from 'parser/core/EventsNormalizer';
import { AnyEvent, EventType } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/shaman';

class IcefuryNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent, idx: number) => {
      fixedEvents.push(event);
      if (
        (event.type === EventType.ApplyBuff ||
          event.type === EventType.RefreshBuff ||
          event.type === EventType.ApplyBuffStack) &&
        event.ability.guid === SPELLS.ICEFURY.id
      ) {
        if (event.type === EventType.ApplyBuffStack) {
          const reorder = fixedEvents.splice(idx, 1);
          fixedEvents.push(
            {
              ...event,
              type: EventType.ApplyBuff,
            },
            ...reorder,
          );
        } else {
          const newEvent = {
            ...event,
            ability: {
              ...event.ability,
              guid: SPELLS.ICEFURY_CAST.id,
            },
            __fabricated: true,
            __modified: true,
          };

          fixedEvents.splice(idx, 1, newEvent);
        }
      }
    });

    return fixedEvents;
  }
}

export default IcefuryNormalizer;
