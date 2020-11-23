import FocusCapTracker from 'parser/hunter/shared/modules/resources/FocusCapTracker';
import { HUNTER_BASE_FOCUS_REGEN } from 'parser/hunter/shared/constants';
import { TRUESHOT_FOCUS_INCREASE } from 'parser/hunter/marksmanship/constants';
import SPELLS from 'common/SPELLS';

class MarksmanshipFocusCapTracker extends FocusCapTracker {

  getBaseRegenRate() {
    let regenRate = HUNTER_BASE_FOCUS_REGEN;
    if (this.selectedCombatant.hasBuff(SPELLS.TRUESHOT.id)) {
      regenRate *= (1 + TRUESHOT_FOCUS_INCREASE);
    }
    return regenRate;
  }
}

export default MarksmanshipFocusCapTracker;
