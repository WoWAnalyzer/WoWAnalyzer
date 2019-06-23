import SPELLS from 'common/SPELLS/index';

import FilteredDamageTracker from '../../../shared/casttracker/FilteredDamageTracker';
import SpellUsable from '../../../shared/SpellUsable';

class BetweenTheEyesDamageTracker extends FilteredDamageTracker {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  shouldProcessEvent(event) {
    // isOnCooldown returns true when this event is a BTE cast, but we want to keep those casts too
    if(event.ability.guid !== SPELLS.BETWEEN_THE_EYES.id && this.spellUsable.isOnCooldown(SPELLS.BETWEEN_THE_EYES.id)){
      return false;
    }

    const hasRelevantTrait = this.selectedCombatant.hasTrait(SPELLS.ACE_UP_YOUR_SLEEVE.id) || this.selectedCombatant.hasTrait(SPELLS.DEADSHOT.id);
    const hasRuthlessPrecision = this.selectedCombatant.hasBuff(SPELLS.RUTHLESS_PRECISION.id);
    return hasRelevantTrait || hasRuthlessPrecision;
  }
}

export default BetweenTheEyesDamageTracker;
