import SPELLS from 'common/SPELLS';

import CoreAbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class AbilityTracker extends CoreAbilityTracker {

  on_byPlayer_cast(event) {
    if (super.on_byPlayer_cast) {
      super.on_byPlayer_cast(event);
    }
    const spellId = event.ability.guid;
    const cast = super.getAbility(spellId, event.ability);

    if (spellId === SPELLS.POWER_WORD_SHIELD.id) {
      const hasRapture = this.owner.modules.combatants.selected.hasBuff(SPELLS.RAPTURE.id, event.timestamp);

      if (hasRapture) {
        cast.raptureCasts = (cast.raptureCasts || 0) + 1;
      }
    }
  }
}

export default AbilityTracker;
