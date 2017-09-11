import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

class SeaStarOfTheDepthmother extends Module {
  static dependencies = {
    combatants: Combatants,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.SEA_STAR_OF_THE_DEPTHMOTHER.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.OCEANS_EMBRACE.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_finished() {
    if (debug) {
      console.log(`Healing: ${this.healing}`);
    }
  }

  item() {
    return {
      item: ITEMS.SEA_STAR_OF_THE_DEPTHMOTHER,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
}

export default SeaStarOfTheDepthmother;
