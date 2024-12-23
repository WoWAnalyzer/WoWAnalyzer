import { FocusCapTracker } from 'analysis/retail/hunter/shared';
import { TALENTS_HUNTER } from 'common/TALENTS';

import {
  BASE_BM_FOCUS_MAX,
  BASE_BM_FOCUS_REGEN,
  PACK_TACTICS_FOCUS_REGEN_INCREASE,
} from '../../constants';

class BeastMasteryFocusCapTracker extends FocusCapTracker {
  getBaseRegenRate() {
    return this.selectedCombatant.hasTalent(TALENTS_HUNTER.PACK_TACTICS_TALENT)
      ? BASE_BM_FOCUS_REGEN * PACK_TACTICS_FOCUS_REGEN_INCREASE
      : BASE_BM_FOCUS_REGEN;
  }

  currentMaxResource() {
    return BASE_BM_FOCUS_MAX;
  }
}

export default BeastMasteryFocusCapTracker;
