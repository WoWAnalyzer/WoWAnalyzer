import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Combatants from 'Parser/Core/Modules/Combatants';

import FilteredDamageTracker from '../CastTracker/FilteredDamageTracker';

class MantleDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    combatants: Combatants,
  };
  
	on_initialized(){
		this.active = this.combatants.selected.hasShoulder(ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.id);
  }

  shouldProcessEvent(event) {
    return this.combatants.selected.hasBuff(SPELLS.MASTER_ASSASSINS_INITIATIVE_BUFF.id);
  }
}

export default MantleDamageTracker;