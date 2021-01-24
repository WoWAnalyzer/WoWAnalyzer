import { FocusCapTracker } from '@wowanalyzer/hunter';
import { BASE_FOCUS_REGEN_SV, BASE_MAX_FOCUS_SV } from '@wowanalyzer/hunter-survival/src/constants';

class SurvivalFocusCapTracker extends FocusCapTracker {

  getBaseRegenRate() {
    const regenRate = BASE_FOCUS_REGEN_SV;
    return regenRate;
  }

  currentMaxResource() {
    const max = BASE_MAX_FOCUS_SV;
    return max;
  }

}

export default SurvivalFocusCapTracker;
