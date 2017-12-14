import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import FilteredDamageTracker from '../CastTracker/FilteredDamageTracker';

class SymbolsDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    combatants: Combatants,
  };
  
  shouldProcessEvent(event) {
    return this.combatants.selected.hasBuff(SPELLS.SYMBOLS_OF_DEATH.id);
  }
}

export default SymbolsDamageTracker;