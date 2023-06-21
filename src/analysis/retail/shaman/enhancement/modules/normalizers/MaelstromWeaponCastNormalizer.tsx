import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { MAELSTROM_WEAPON_INSTANT_CAST } from './EventLinkNormalizer';

/** This normalizer removes the begincast event, and fabricated beginchannel and endchannel
 * events for instant cast enhancement spells */

class MaelstromWeaponCastNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent, idx: number) => {
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
