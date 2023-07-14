import { MappedEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { MAELSTROM_WEAPON_INSTANT_CAST } from './EventLinkNormalizer';

/** This normalizer removes the begincast event, and fabricated beginchannel and endchannel
 * events for instant cast enhancement spells */

class MaelstromWeaponCastNormalizer extends EventsNormalizer {
  normalize(events: MappedEvent[]): MappedEvent[] {
    const fixedEvents: MappedEvent[] = [];
    events.forEach((event: MappedEvent, idx: number) => {
      const linkedEvents = event._linkedEvents?.find(
        (x) => x.relation === MAELSTROM_WEAPON_INSTANT_CAST,
      );
      if (linkedEvents) {
        if (event.type === EventType.Cast || event.type === EventType.FreeCast) {
          fixedEvents.push(event);
        }
      } else {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default MaelstromWeaponCastNormalizer;
