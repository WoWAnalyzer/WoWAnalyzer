import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';
import { Options } from 'parser/core/Analyzer';
import { Event, EventType } from 'parser/core/Events';

class OpportunityDamageTracker extends FilteredDamageTracker {
  constructor(options: Options) {
    super(options);

    this.subscribeInefficientCast(
      [SPELLS.SINISTER_STRIKE],
      () => `Pistol Shot should be used as your builder during Opportunity`,
    );
  }

  shouldProcessEvent(event: Event<EventType.Event>): boolean {
    return this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id);
  }
}

export default OpportunityDamageTracker;
