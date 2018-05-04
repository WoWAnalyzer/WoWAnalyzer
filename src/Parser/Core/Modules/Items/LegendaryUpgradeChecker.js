import React from 'react';

import ItemLink from 'common/ItemLink';
import ITEM_QUALITIES from 'common/ITEM_QUALITIES';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const MAX_LEGENDARY_ILVL = 1000;
const debug = false;

class LegendaryUpgradeChecker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get legendaries() {
    return Object.values(this.combatants.selected.gear).filter(item => item.quality === ITEM_QUALITIES.LEGENDARY);
  }
  get upgradedLegendaries() {
    return this.legendaries.filter(item => item.itemLevel >= MAX_LEGENDARY_ILVL);
  }

  suggestions(when) {
    this.legendaries.forEach(item => {
        debug && console.log(`Legendary ${item.id} is ${item.itemLevel}`);

        when(item.itemLevel).isLessThan(MAX_LEGENDARY_ILVL)
          .addSuggestion((suggest, actual, recommended) => {
            return suggest(<React.Fragment><ItemLink id={item.id} /> is not the max item level it can be. You should upgrade <ItemLink id={item.id} /> to the current max legendary item level.</React.Fragment>)
              .icon(item.icon)
              .actual(`It's currently ${actual}`)
              .recommended(`the current maximum is ${recommended}`)
              .staticImportance(SUGGESTION_IMPORTANCE.REGULAR);
          });
      });
  }
}

export default LegendaryUpgradeChecker;
