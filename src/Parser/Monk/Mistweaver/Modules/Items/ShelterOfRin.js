import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

class ShelterOfRin extends Analyzer {
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

  item() {
    return {
      item: ITEMS.SHELTER_OF_RIN,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default ShelterOfRin;
