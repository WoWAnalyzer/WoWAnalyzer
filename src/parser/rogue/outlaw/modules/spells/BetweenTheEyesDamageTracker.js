import SPELLS from 'common/SPELLS/index';

import FilteredDamageTracker from '../../../shared/casttracker/FilteredDamageTracker';
import SpellUsable from '../../../shared/SpellUsable';

class BetweenTheEyesDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  shouldProcessEvent(event) {
    return !this.spellUsable.isOnCooldown(SPELLS.BETWEEN_THE_EYES.id);
  }
}

export default BetweenTheEyesDamageTracker;
