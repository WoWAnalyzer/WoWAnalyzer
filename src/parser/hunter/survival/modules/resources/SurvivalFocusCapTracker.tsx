import FocusCapTracker from 'parser/hunter/shared/modules/resources/FocusCapTracker';
import { BASE_FOCUS_REGEN_SV, BASE_MAX_FOCUS_SV } from 'parser/hunter/survival/constants';

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
