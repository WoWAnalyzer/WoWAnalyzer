import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import ItemHealingDone from 'Main/ItemHealingDone';

class ObsidianStoneSpaulders extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  healing = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasShoulder(ITEMS.OBSIDIAN_STONE_SPAULDERS.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.OBSIDIAN_STONE_SPAULDERS_HEAL.id) {
      this.healing += event.amount;
    }
  }

  item() {
    return {
      item: ITEMS.OBSIDIAN_STONE_SPAULDERS,
      result: <ItemHealingDone amount={this.healing} />,
    };
  }
}

export default ObsidianStoneSpaulders;
