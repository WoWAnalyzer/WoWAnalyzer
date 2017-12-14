import React from 'react';
import ItemLink from 'common/ItemLink';
import ITEM_QUALITIES from 'common/ITEM_QUALITIES';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

// Make sure to push this once we get to 1000!
const MAX_LEGENDARY_ILVL = 1000;
const debug = false;

class LegendaryUpgradeChecker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  suggestions(when) {
    const slots = this.combatants.selected._gearItemsBySlotId;
    Object.values(slots)
      .filter(item => item.quality === ITEM_QUALITIES.LEGENDARY)
      .forEach(item => {
        debug && console.log(`Legendary ${item.id} is ${item.itemLevel}`);

        when(item.itemLevel).isLessThan(MAX_LEGENDARY_ILVL)
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<span><ItemLink id={item.id} /> is not the maximum item level it can be. You should upgrade <ItemLink id={item.id} /> to the maximum item level for legendaries.</span>)
              .icon(item.icon)
              .actual(`It's currently ${actual}`)
              .recommended(`the current maximum is ${recommended}`)
              .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
          });
      });
  }
}

export default LegendaryUpgradeChecker;
