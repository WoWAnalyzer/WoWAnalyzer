import SPELLS from 'common/SPELLS';
import { FilteredDamageTracker } from '@wowanalyzer/rogue';

class OpportunityDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event) {
    return this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id);
  }
}

export default OpportunityDamageTracker;
