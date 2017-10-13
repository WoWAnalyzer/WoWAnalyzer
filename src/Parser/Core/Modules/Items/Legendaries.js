import React from 'react';
import ItemLink from 'common/ItemLink';
import ITEM_QUALITIES from 'common/ITEM_QUALITIES';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

// Make sure to push this once we get to 1000!
const MAX_LEGENDARY_ILVL = 970;
const debug = false;

class Legendaries extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  suggestions(when) {
    const slots = this.combatants.selected._gearItemsBySlotId;
    Object.values(slots).filter(item => item.quality === ITEM_QUALITIES.LEGENDARY)
      .forEach((item) => {
        if (debug) {
          console.log(`Legendary ${item.id} is ${item.itemLevel}`);
        }

        when(item.itemLevel).isLessThan(MAX_LEGENDARY_ILVL).addSuggestion((suggest) => {
          return suggest(<span>You should consider upgrading <ItemLink id={item.id} /> to the maximum item level for legendaries (currently {MAX_LEGENDARY_ILVL}).</span>)
            .icon(item.icon)
            .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
        });
    });
  }
}

export default Legendaries;
