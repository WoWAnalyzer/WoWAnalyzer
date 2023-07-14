import { EventType, Event, MappedEvent } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

type EnergizeEvent = Event<'energize'>;

type CompatEvent = MappedEvent | EnergizeEvent;

/**
 * Temporary compatibility class to convert old energize events to new
 * resourcechange events.
 *
 * WCL will be renaming the event from `energize` to `resourcechange` in an
 * upcoming update.
 **/
export default class EnergizeCompat extends EventsNormalizer {
  priority = -1000;
  normalize(events: MappedEvent[]) {
    return events.map((event) => {
      if ((event as CompatEvent).type === 'energize') {
        event.type = EventType.ResourceChange;
      }
      return event;
    });
  }
}
