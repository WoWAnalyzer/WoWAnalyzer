import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import ItemHealingDone from 'Interface/Others/ItemHealingDone';

class ShelterOfRin extends Analyzer {
  healing = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasChest(ITEMS.SHELTER_OF_RIN.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.SHELTER_OF_RIN_HEAL.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.SHELTER_OF_RIN,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default ShelterOfRin;
