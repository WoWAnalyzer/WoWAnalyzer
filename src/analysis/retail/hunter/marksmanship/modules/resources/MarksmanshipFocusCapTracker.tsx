import { TRUESHOT_FOCUS_INCREASE } from 'analysis/retail/hunter/marksmanship/constants';
import { FocusCapTracker } from 'analysis/retail/hunter/shared';
import { HUNTER_BASE_FOCUS_REGEN } from 'analysis/retail/hunter/shared/constants';
import SPELLS from 'common/SPELLS';

class MarksmanshipFocusCapTracker extends FocusCapTracker {
  getBaseRegenRate() {
    let regenRate = HUNTER_BASE_FOCUS_REGEN;
    if (this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      regenRate *= 1 + TRUESHOT_FOCUS_INCREASE;
    }
    return regenRate;
  }
}

export default MarksmanshipFocusCapTracker;
