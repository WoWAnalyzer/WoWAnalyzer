import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS_OTHERS';

import Module from 'Parser/Core/Module';

class VialOfCeaselessToxins extends Module {
  damageIncreased = 0;
  totalToxinCast = 0;

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasTrinket(ITEMS.VIAL_OF_CEASELESS_TOXINS.id);
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.CEASELESS_TOXIN.id) {
      this.totalToxinCast++;
      return;
    }
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.CEASELESS_TOXIN.id) {
      this.damageIncreased += event.amount;
    }
  }
}

export default VialOfCeaselessToxins;
