import React from 'react';
import ITEM_QUALITIES from 'common/ITEM_QUALITIES';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

const MAX_NUMBER_OF_LEGENDARIES = 2;

class LegendaryCountChecker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  suggestions(when) {
    const slots = this.combatants.selected._gearItemsBySlotId;
    const legendaryCount = Object.values(slots).filter(item => item.quality === ITEM_QUALITIES.LEGENDARY).length;

    when(legendaryCount).isLessThan(MAX_NUMBER_OF_LEGENDARIES)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>You are not wearing the maximum number of legendaries.</span>)
          .icon(SPELLS.SHADOW_WORD_PAIN.icon)
          .actual(`You're wearing ${actual}`)
          .recommended(`the current maximum is ${recommended}`)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}

export default LegendaryCountChecker;
