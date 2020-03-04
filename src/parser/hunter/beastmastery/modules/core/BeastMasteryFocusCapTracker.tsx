import FocusCapTracker
  from 'parser/hunter/shared/modules/resources/FocusCapTracker';

const BASE_FOCUS_REGEN = 10;
const BASE_FOCUS_MAX = 120;

class BeastMasteryFocusCapTracker extends FocusCapTracker {

  getBaseRegenRate() {
    const regenRate = BASE_FOCUS_REGEN;
    return regenRate;
  }

  currentMaxResource() {
    const max = BASE_FOCUS_MAX;
    return max;
  }
}

export default BeastMasteryFocusCapTracker;
