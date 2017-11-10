import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class XonisCaress extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasHands(ITEMS.XONIS_CARESS.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.XONIS_CARESS.id) {
      this.healing += event.amount;
    }
  }

  // TODO also mention if player made use of reduced CD on Ironbark?
  item() {
    return {
      item: ITEMS.XONIS_CARESS,
      result: (
        <dfn data-tip="This accounts only for the extra healing, and doesn't include the reduced Ironbark cooldown.">
          {this.owner.formatItemHealingDone(this.healing)}
        </dfn>
      ),
    };
  }

}

export default XonisCaress;
