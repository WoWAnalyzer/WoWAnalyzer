import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

const LEGENDARY_NOBUNDO_BUFF = 208764;
const LEGENDARY_NOBUNDO_BUFF_EXPIRATION_BUFFER = 50; // the buff expiration can occur several MS before the heal event is logged, this is the buffer time that an IoL charge may have dropped during which it will still be considered active.

class Nobundo extends Analyzer {
  discounts = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasWrists(ITEMS.NOBUNDOS_REDEMPTION.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (!(spellId === SPELLS.HEALING_SURGE_RESTORATION.id)) {
      return;
    }

    const buff = this.owner.modules.combatants.selected.getBuff(LEGENDARY_NOBUNDO_BUFF, event.timestamp, LEGENDARY_NOBUNDO_BUFF_EXPIRATION_BUFFER);

    if (buff) {
      this.discounts += 1;
    }
  }

  item() {
    return {
    item: ITEMS.NOBUNDOS_REDEMPTION,
    result: (
        <span>
          ${this.discounts} discounted Healing Surges
        </span>
      ),
    };
  }
}

export default Nobundo;
