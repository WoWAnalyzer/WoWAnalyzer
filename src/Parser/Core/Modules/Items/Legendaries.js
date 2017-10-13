import React from 'react';
import ItemLink from 'common/ItemLink';
import ITEM_QUALITIES from 'common/ITEM_QUALITIES';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

// Make sure to push this once we get to 1000!
const MAX_LEGENDARY_ILVL = 970;

class Legendaries extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  legendaries = [];
  debug = false;

  on_finished() {
    const slots = this.combatants.selected._gearItemsBySlotId;
    for(let index = 0; index < Object.keys(slots).length; index++) {
      const item = slots[index];
      if (item.quality < ITEM_QUALITIES.LEGENDARY) {
        this.legendaries.push(item);
      }
    }
  }

  suggestions(when) {
    for(const item of this.legendaries) {
      if (this.debug) {
        console.log(`Legendary ${item.id} is ${item.itemLevel}`);
      }

      when(item.itemLevel === MAX_LEGENDARY_ILVL).isTrue().addSuggestion((suggest) => {
        return suggest(<span>You should consider upgrading <ItemLink id={item.id} /> to the maximum item level for legendaries (currently {MAX_LEGENDARY_ILVL}).</span>)
          .icon(item.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
    }
  }
}

export default Legendaries;
