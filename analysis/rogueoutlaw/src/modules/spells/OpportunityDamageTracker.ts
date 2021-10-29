import SPELLS from 'common/SPELLS';
import { Event, EventType } from 'parser/core/Events';

import { FilteredDamageTracker } from '@wowanalyzer/rogue';

class OpportunityDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event: Event<EventType.Event>): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id);
  }
}

export default OpportunityDamageTracker;
