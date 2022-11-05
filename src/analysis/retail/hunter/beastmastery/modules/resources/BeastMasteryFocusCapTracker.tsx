import { FocusCapTracker } from 'analysis/retail/hunter/shared';
import { TALENTS_HUNTER } from 'common/TALENTS';

import {
  BEAST_MASTERY_FOCUS_MAX,
  BEAST_MASTERY_FOCUS_REGEN,
  KINDRED_SPIRITS_FOCUS_INCREASE,
  PACK_TACTICS_FOCUS_REGEN_INCREASE,
} from '../../constants';

class BeastMasteryFocusCapTracker extends FocusCapTracker {
  getBaseRegenRate() {
    return this.selectedCombatant.hasTalent(TALENTS_HUNTER.PACK_TACTICS_TALENT)
      ? BEAST_MASTERY_FOCUS_REGEN * PACK_TACTICS_FOCUS_REGEN_INCREASE
      : BEAST_MASTERY_FOCUS_REGEN;
  }

  currentMaxResource() {
    const kindredSpiritsRank = this.selectedCombatant.getTalentRank(
      TALENTS_HUNTER.KINDRED_SPIRITS_TALENT,
    );
    const increasedFocus = KINDRED_SPIRITS_FOCUS_INCREASE[kindredSpiritsRank];
    return BEAST_MASTERY_FOCUS_MAX + increasedFocus;
  }
}

export default BeastMasteryFocusCapTracker;
