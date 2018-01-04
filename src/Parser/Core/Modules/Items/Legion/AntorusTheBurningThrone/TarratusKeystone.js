import React from 'react';

import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

/*
 * Tarratus Keystone -
 * Use: Open a portal at an ally's location that releases brilliant light, restoring 1633313 health split amongst injured allies within 20 yds. (1 Min, 30 Sec Cooldown)
 */
class TarratusKeystone extends Analyzer {
  static dependencies = {
      combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.TARRATUS_KEYSTONE.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.TARRATUS_KEYSTONE.id) {
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  item() {
    return {
      item: ITEMS.TARRATUS_KEYSTONE,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default TarratusKeystone;
