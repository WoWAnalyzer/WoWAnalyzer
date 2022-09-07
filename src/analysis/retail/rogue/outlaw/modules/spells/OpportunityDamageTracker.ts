import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { Event, EventType } from 'parser/core/Events';

class OpportunityDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event: Event<EventType.Event>): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id);
  }
}

export default OpportunityDamageTracker;
