import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

const debug = true;

class DecieversGrandDesign extends Module {
  healing = 0;
  healingAbsorb = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.DECEIVERS_GRAND_DESIGN.id);
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.GUIDING_HAND.id) {
      this.healing += event.amount || 0;
      this.healing += event.absorbed || 0;
    }
  }

  on_byPlayer_absorbed(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.FRUITFUL_MACHINATIONS.id) {
      this.healingAbsorb += event.amount || 0;
      this.healingAbsorb += event.absorbed || 0;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.GUIDING_HAND.id) {

    }

  }

  on_finished() {
    if(debug) {
      console.log('Healing: ' + this.healing);
      console.log('Absorbed: ' + this.healingAbsorb);
    }
  }

}

export default DecieversGrandDesign;
