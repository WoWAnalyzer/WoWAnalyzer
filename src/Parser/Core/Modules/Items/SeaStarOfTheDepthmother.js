import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

/*
 * Sea Star of the Depth Mother -
 * Equip: Your multi-target healing spell has a chance to grant you Ocean's Embrace, healing your nearest injured ally within 15 yds for 29716 every 0.25 sec for 8 sec.
 */
class SeaStarOfTheDepthmother extends Analyzer {
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
