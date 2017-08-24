import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

const debug = false;

class BarbaricMindslaver extends Module {
  healing = 0;

  on_initialized() {
    this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.BARBARIC_MINDSLAVER.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if(spellId === SPELLS.GUILTY_CONSCIENCE.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_finished() {
    if(debug) {
      console.log('Healing: ' + this.healing);
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
