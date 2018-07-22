import SPELLS from 'common/SPELLS';

import FilteredDamageTracker from '../../../Common/CastTracker/FilteredDamageTracker';

class SymbolsDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event) {
    return this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id);
  }
}

export default SymbolsDamageTracker;