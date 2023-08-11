import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { isFromTipTheScales } from './CastLinkNormalizer';

/**
 * Empowers cast with Tip the Scales doesn't produce an EmpowerEnd event, only Cast event
 * For cancelled empowers still produce Cast event, so for analysis we would like to strictly
 * use EmpowerEnd events since they only get produced when the cast is succesfully cast.
 * So when an Empower has been cast with Tip ther Scales, we fabricate an EmpowerEnd event.
 */

class EmpowerNormalizer extends EventsNormalizer {
  // Set lower priority to ensure this runs after our CastLinkNormalizer
  priority = 101;
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: any[] = [];
    events.forEach((event) => {
      if (event.type === EventType.Cast && isFromTipTheScales(event)) {
        const fabricatedEvent = {
          ...event,
          type: EventType.EmpowerEnd,
          __fabricated: true,
        };
        fixedEvents.push(fabricatedEvent);
      }
      fixedEvents.push(event);
    });
    return fixedEvents;
  }
}

export default EmpowerNormalizer;
