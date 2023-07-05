import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { PRESCIENCE_APPLY_REMOVE_LINK } from './CastLinkNormalizer';

/** This normalizer removes the applybuff and removebuff from undefined targets
 * these targets are things like lights hammer which only taints our analysis */

class PrescienceNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]): AnyEvent[] {
    const fixedEvents: AnyEvent[] = [];
    events.forEach((event: AnyEvent, idx: number) => {
      const linkedEvents = event._linkedEvents?.find(
        (x) => x.relation === PRESCIENCE_APPLY_REMOVE_LINK,
      );
      if (linkedEvents) {
        if (
          (event.type === EventType.ApplyBuff || event.type === EventType.RemoveBuff) &&
          event.targetID !== undefined
        ) {
          fixedEvents.push(event);
        }
      } else {
        fixedEvents.push(event);
      }
    });
    return fixedEvents;
  }
}

export default PrescienceNormalizer;
