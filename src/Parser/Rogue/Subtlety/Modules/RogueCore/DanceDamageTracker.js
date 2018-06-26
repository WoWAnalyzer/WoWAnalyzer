import SPELLS from 'common/SPELLS';

import FilteredDamageTracker from '../../../Common/CastTracker/FilteredDamageTracker';

class DanceDamageTracker extends FilteredDamageTracker {
  shouldProcessEvent(event) {
    return this.selectedCombatant.hasBuff(SPELLS.SHADOW_DANCE_BUFF.id);
  }
}

export default DanceDamageTracker;