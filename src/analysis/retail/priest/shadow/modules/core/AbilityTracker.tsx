import SPELLS from 'common/SPELLS';
import CoreAbilityTracker from 'parser/shared/modules/AbilityTracker';
import { TALENTS_PRIEST } from 'common/TALENTS';

class AbilityTracker extends CoreAbilityTracker {
  getAbility(spellId: number, abilityInfo = null) {
    if (spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id) {
      return super.getAbility(TALENTS_PRIEST.SHADOWFIEND_TALENT.id, abilityInfo);
    }
    return super.getAbility(spellId, abilityInfo);
  }
}

export default AbilityTracker;
