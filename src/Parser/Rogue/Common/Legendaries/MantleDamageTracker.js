import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import FilteredDamageTracker from '../CastTracker/FilteredDamageTracker';

class MantleDamageTracker extends FilteredDamageTracker {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasShoulder(ITEMS.MANTLE_OF_THE_MASTER_ASSASSIN.id);
  }

  shouldProcessEvent(event) {
    return this.selectedCombatant.hasBuff(SPELLS.MASTER_ASSASSINS_INITIATIVE_BUFF.id);
  }
}

export default MantleDamageTracker;
