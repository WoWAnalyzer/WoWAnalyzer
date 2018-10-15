import SPELLS from 'common/SPELLS/index';

import FilteredDamageTracker from '../../../shared/casttracker/FilteredDamageTracker';

class SymbolsDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event) {
    return this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id);
  }
}

export default SymbolsDamageTracker;
