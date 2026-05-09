import SPELLS from 'common/SPELLS/evoker';
import { AnyEvent, ApplyBuffStackEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';
/**
 * Until Temporal Burst loses a stack, it is treated as being on 1 stack, rather than 30.
 * This normalizer fabricates an ApplyBuffStack event on application so that the stacks are correctly tracked.
 */
class TemporalBurstStackNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];

    events.forEach((event) => {
      if (
        event.type != EventType.ApplyBuff ||
        event.ability.guid !== SPELLS.TEMPORAL_BURST_BUFF.id
      ) {
        fixedEvents.push(event);
        return;
      }
      const sID = event.sourceID || -1;

      const fabApplyBuffStackEvent: ApplyBuffStackEvent = {
        ...event,
        stack: 30,
        sourceID: sID,
        type: EventType.ApplyBuffStack,
        timestamp: event.timestamp,
        __fabricated: true,
      };
      fixedEvents.push(event);
      fixedEvents.push(fabApplyBuffStackEvent);
    });

    return fixedEvents;
  }
}
export default TemporalBurstStackNormalizer;
