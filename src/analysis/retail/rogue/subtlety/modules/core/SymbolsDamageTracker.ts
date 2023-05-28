import { FilteredDamageTracker } from 'analysis/retail/rogue/shared';
import SPELLS from 'common/SPELLS';

class SymbolsDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event: any) {
    return this.selectedCombatant.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id);
  }
}

export default SymbolsDamageTracker;
