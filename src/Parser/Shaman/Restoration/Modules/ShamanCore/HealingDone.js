import SPELLS from 'common/SPELLS';

import CoreHealingDone from 'Parser/Core/Modules/HealingDone';

class HealingDone extends CoreHealingDone {
  on_damage(event) {
    // Removing Spirit link from total healing done by subtracting the damage done of it
    const spellId = event.ability.guid;
    if (!this.owner.byPlayerPet(event)) {
      return;
    }
    if (spellId === SPELLS.SPIRIT_LINK_TOTEM_REDISTRIBUTE.id) {
      this._subtractHealing(event, event.amount, 0, 0);
    }
  }
}

export default HealingDone;
