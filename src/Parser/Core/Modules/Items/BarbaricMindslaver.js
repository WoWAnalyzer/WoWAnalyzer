import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const debug = false;

/*
 * Barbaric Mindslaver -
 * Equip: Your healing effects have a chance to do an additional 165,326 healing. This occurs more often while you are at low mana. (Approximately 6 procs per minute)
 */
class BarbaricMindslaver extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.BARBARIC_MINDSLAVER.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.GUILTY_CONSCIENCE.id) {
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
      item: ITEMS.BARBARIC_MINDSLAVER,
      result: this.owner.formatItemHealingDone(this.healing),
    };
  }
}

export default BarbaricMindslaver;
