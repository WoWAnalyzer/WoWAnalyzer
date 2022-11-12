import { FocusCapTracker } from 'analysis/retail/hunter/shared';
import { TALENTS_HUNTER } from 'common/TALENTS';

import {
  BASE_BM_FOCUS_MAX,
  BASE_BM_FOCUS_REGEN,
  KINDRED_SPIRITS_FOCUS_INCREASE,
  PACK_TACTICS_FOCUS_REGEN_INCREASE,
} from '../../constants';

class BeastMasteryFocusCapTracker extends FocusCapTracker {
  getBaseRegenRate() {
    return this.selectedCombatant.hasTalent(TALENTS_HUNTER.PACK_TACTICS_TALENT)
      ? BASE_BM_FOCUS_REGEN * PACK_TACTICS_FOCUS_REGEN_INCREASE
      : BASE_BM_FOCUS_REGEN;
  }

  currentMaxResource() {
    const kindredSpiritsRank = this.selectedCombatant.getTalentRank(
      TALENTS_HUNTER.KINDRED_SPIRITS_TALENT,
    );
    const increasedFocus = KINDRED_SPIRITS_FOCUS_INCREASE[kindredSpiritsRank];
    return BASE_BM_FOCUS_MAX + increasedFocus;
  }
}

export default BeastMasteryFocusCapTracker;
