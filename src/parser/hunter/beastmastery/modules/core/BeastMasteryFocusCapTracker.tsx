import FocusCapTracker
  from 'parser/hunter/shared/modules/resources/FocusCapTracker';

const BASE_FOCUS_REGEN = 10;
const BASE_FOCUS_MAX = 120;

class BeastMasteryFocusCapTracker extends FocusCapTracker {

  getBaseRegenRate() {
    const regenRate = BASE_FOCUS_REGEN;
    return regenRate;
  }

  naturalRegenRate() {
    const regen = super.naturalRegenRate();
    return regen;
  }

  currentMaxResource() {
    const max = BASE_FOCUS_MAX;
    // What should be x.5 becomes x in-game.
    return Math.floor(max);
  }
}

export default BeastMasteryFocusCapTracker;
