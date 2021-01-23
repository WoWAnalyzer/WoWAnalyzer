import SPELLS from 'common/SPELLS';

import FilteredDamageTracker from '../../../shared/casttracker/FilteredDamageTracker';

class OpportunityDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event) {
    return this.selectedCombatant.hasBuff(SPELLS.OPPORTUNITY.id);
  }
}

export default OpportunityDamageTracker;
