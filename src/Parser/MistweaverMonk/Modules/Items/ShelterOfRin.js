import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';

import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class ShelterOfRin extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasChest(ITEMS.SHELTER_OF_RIN.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHELTER_OF_RIN_HEAL.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Shelter of Rin Healing: ${this.healing}`);
    }
  }

  item() {
    return {
      item: ITEMS.SHELTER_OF_RIN,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
}

export default ShelterOfRin;
