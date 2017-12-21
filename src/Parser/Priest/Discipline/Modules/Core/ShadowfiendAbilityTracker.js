import SPELLS from 'common/SPELLS';

import CoreAbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class ShadowfiendAbilityTracker extends CoreAbilityTracker {

  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }
    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id || spellId === SPELLS.LIGHTSPAWN.id) {
      event.ability.guid = SPELLS.SHADOWFIEND.id;
    }
  }
}

export default ShadowfiendAbilityTracker;
