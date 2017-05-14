import SPELLS from 'common/SPELLS';

import CoreAbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class AbilityTracker extends CoreAbilityTracker {
  on_byPlayer_cast(event) {
    super.on_byPlayer_cast(event);

    const spellId = event.ability.guid;
    if (spellId === SPELLS.SHADOWFIEND_WITH_GLYPH_OF_THE_SHA.id) {
      const cast = this.getAbility(SPELLS.SHADOWFIEND.id, event.ability);
      cast.casts = (cast.casts || 0) + 1;
    }
  }
}

export default AbilityTracker;
