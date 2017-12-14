import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import FilteredDamageTracker from '../CastTracker/FilteredDamageTracker';

class DanceDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    combatants: Combatants,
  };
  
  shouldProcessEvent(event) {
    return this.combatants.selected.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id);
  }
}

export default DanceDamageTracker;