import SPELLS from 'common/SPELLS';

import { FilteredDamageTracker } from '@wowanalyzer/rogue';

class SymbolsDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event: any) {
    return this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id);
  }
}

export default SymbolsDamageTracker;
