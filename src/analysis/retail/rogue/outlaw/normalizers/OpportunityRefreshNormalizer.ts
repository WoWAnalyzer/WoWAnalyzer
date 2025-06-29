import SPELLS from 'common/SPELLS/rogue';
import { AnyEvent, EventType } from 'parser/core/Events';
import EventsNormalizer from 'parser/core/EventsNormalizer';

const MAX_DELAY = 25;

/**
 * When an Opportunity stack is removed or applied, a refresh buff event is generated.
 * This normalizer removes the refresh event because it messes up analysis.
 */
class OpportunityRefreshNormalizer extends EventsNormalizer {
  normalize(events: AnyEvent[]) {
    const fixedEvents: AnyEvent[] = [];
    let lastOpportunityStackEvent = 0;

    events.forEach((event) => {
      if (
        event.type !== EventType.RemoveBuffStack &&
        event.type !== EventType.RefreshBuff &&
        event.type !== EventType.ApplyBuffStack
      ) {
        fixedEvents.push(event);
        return;
      }

      if (event.ability.guid !== SPELLS.OPPORTUNITY.id) {
        fixedEvents.push(event);
        return;
      }

      if (event.type !== EventType.RefreshBuff) {
        // We always want this event
        fixedEvents.push(event);
        lastOpportunityStackEvent = event.timestamp;
        return;
      }

      const diff = event.timestamp - lastOpportunityStackEvent;
      if (diff > MAX_DELAY) {
        fixedEvents.push(event);
      }
    });

    return fixedEvents;
  }
}
export default OpportunityRefreshNormalizer;
