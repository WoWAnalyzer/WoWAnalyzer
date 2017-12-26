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

  get legendaries() {
    return Object.values(this.combatants.selected.gear).filter(item => item.quality === ITEM_QUALITIES.LEGENDARY);
  }
  get equipped() {
    return this.legendaries.length;
  }
  get max() {
    return MAX_NUMBER_OF_LEGENDARIES;
  }

  suggestions(when) {
    when(this.legendaryCount).isLessThan(this.maxLegendaryCount)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest('You are not wearing the maximum number of legendaries.')
          .icon(SPELLS.SHADOW_WORD_PAIN.icon)
          .actual(`You're wearing ${actual}`)
          .recommended(`the current maximum is ${recommended}`)
          .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
      });
  }
}

export default LegendaryCountChecker;
