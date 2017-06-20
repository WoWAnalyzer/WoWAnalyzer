import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const GNAWED_THUMB_RING_HEALING_INCREASE = 0.05;

class GnawedThumbRing extends Module {
  healingIncreaseHealing = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasFinger(ITEMS.GNAWED_THUMB_RING.id);
    }
  }

  on_byPlayer_heal(event) {
    if(this.owner.selectedCombatant.hasBuff(SPELLS.GNAWED_THUMB_RING.id)) {
      this.healingIncreaseHealing += calculateEffectiveHealing(event, GNAWED_THUMB_RING_HEALING_INCREASE);
    }
  }

}

export default GnawedThumbRing;
