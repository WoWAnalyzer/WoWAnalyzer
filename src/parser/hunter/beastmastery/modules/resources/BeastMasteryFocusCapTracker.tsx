import { FocusCapTracker } from '@wowanalyzer/hunter';

import { BEAST_MASTERY_FOCUS_MAX, BEAST_MASTERY_FOCUS_REGEN } from '../../constants';

class BeastMasteryFocusCapTracker extends FocusCapTracker {
  getBaseRegenRate() {
    const regenRate = BEAST_MASTERY_FOCUS_REGEN;
    return regenRate;
  }

  currentMaxResource() {
    const max = BEAST_MASTERY_FOCUS_MAX;
    return max;
  }
}

export default BeastMasteryFocusCapTracker;
