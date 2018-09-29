import SPELLS from 'common/SPELLS';

import CoreAbilityTracker from 'parser/core/modules/AbilityTracker';

class AbilityTracker extends CoreAbilityTracker {
  getAbility(spellId, abilityInfo = null) {
    if (spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id) {
      return super.getAbility(SPELLS.SHADOWFIEND.id, abilityInfo);
    }
    return super.getAbility(spellId, abilityInfo);
  }
}

export default AbilityTracker;
