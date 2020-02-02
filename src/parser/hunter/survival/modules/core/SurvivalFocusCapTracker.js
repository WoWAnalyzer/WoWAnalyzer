import FocusCapTracker from 'parser/hunter/shared/modules/resources/FocusCapTracker';

const BASE_FOCUS_REGEN = 5;

class SurvivalFocusCapTracker extends FocusCapTracker {

  getBaseRegenRate() {
    const regenRate = BASE_FOCUS_REGEN;
    return regenRate;
  }

}

export default SurvivalFocusCapTracker;
