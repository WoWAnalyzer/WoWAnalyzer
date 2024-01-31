import SPELLS from 'common/SPELLS';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const MAX_DELAY = 25;

/**
 * When an EB stack is removed, a refresh buff event is generated.
 * This normalizer removes the refresh event because it messes up analysis.
 */
class EBRefreshNormalizer extends EventsNormalizer {
  isEbEvent(event: AnyEvent) {
    return (
      (event.type === EventType.RemoveBuffStack || event.type === EventType.RefreshBuff) &&
      event.ability.guid === SPELLS.ESSENCE_BURST_BUFF.id
    );
  }
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    let skipNext = false;
    events.forEach((event, eventIndex) => {
      if (skipNext) {
        skipNext = false;
      } else if (this.isEbEvent(event)) {
        const castTimestamp = event.timestamp;
        // Look ahead through the events to see if there is a Refresh/RemoveStack at nearly same timestamp
        for (
          let nextEventIndex = eventIndex;
          nextEventIndex < events.length - 1;
          nextEventIndex += 1
        ) {
          const nextEvent = events[nextEventIndex];
          if (this.isEbEvent(nextEvent) && nextEvent.timestamp - castTimestamp <= MAX_DELAY) {
            // Only keep the RemoveBuffStack event
            if (nextEvent.type === EventType.RemoveBuffStack) {
              fixedEvents.push(nextEvent);
            } else {
              fixedEvents.push(event);
            }
            skipNext = true;
            break;
          }
        }
      } else {
        fixedEvents.push(event);
      }
    });

    return fixedEvents;
  }
}
export default EBRefreshNormalizer;
