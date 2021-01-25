import { FocusCapTracker, HUNTER_BASE_FOCUS_REGEN } from '@wowanalyzer/hunter';
import { TRUESHOT_FOCUS_INCREASE } from '@wowanalyzer/hunter-marksmanship/src/constants';
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
