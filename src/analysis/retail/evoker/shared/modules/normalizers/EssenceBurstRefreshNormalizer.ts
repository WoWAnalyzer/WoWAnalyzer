import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
import { EB_BUFF_IDS } from '../../constants';

const MAX_DELAY = 25;

/**
 * When an EB stack is removed, a refresh buff event is generated.
 * This normalizer removes the refresh event because it messes up analysis.
 */
class EssenceBurstRefreshNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    let lastEbRemoveBuffStack = 0;

    events.forEach((event) => {
      if (event.type !== EventType.RemoveBuffStack && event.type !== EventType.RefreshBuff) {
        fixedEvents.push(event);
        return;
      }
      if (!EB_BUFF_IDS.includes(event.ability.guid)) {
        fixedEvents.push(event);
        return;
      }

      if (event.type === EventType.RemoveBuffStack) {
        // We always want this event
        fixedEvents.push(event);
        lastEbRemoveBuffStack = event.timestamp;
        return;
      }

      const diff = event.timestamp - lastEbRemoveBuffStack;
      if (diff > MAX_DELAY) {
        fixedEvents.push(event);
      }
    });

    return fixedEvents;
  }
}
export default EssenceBurstRefreshNormalizer;
