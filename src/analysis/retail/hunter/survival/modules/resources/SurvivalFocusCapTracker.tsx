import { FocusCapTracker } from 'analysis/retail/hunter/shared';
import { HUNTER_BASE_FOCUS_MAX } from 'analysis/retail/hunter/shared/constants';
import TALENTS from 'common/TALENTS/hunter';
class SurvivalFocusCapTracker extends FocusCapTracker {
  currentMaxResource() {
    const additionalFocus = this.selectedCombatant.hasTalent(TALENTS.ENERGETIC_ALLY_TALENT)
      ? 10
      : 0;
    return HUNTER_BASE_FOCUS_MAX + additionalFocus;
  }
}

export default SurvivalFocusCapTracker;
