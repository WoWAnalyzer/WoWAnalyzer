import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class JudgmentOfLight extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  get suggestionThresholds() {
    return {
      actual: this.combatants.selected.hasTalent(SPELLS.JUDGMENT_OF_LIGHT_TALENT.id),
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
      when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => {
        return suggest(
          <Wrapper>
            <SpellLink id={SPELLS.SANCTIFIED_WRATH_TALENT.id} /> is rarely the best talent to pick in the row. Unless you specifically need the buff to <SpellLink id={SPELLS.AVENGING_WRATH.id} /> for this fight you should use <SpellLink id={SPELLS.JUDGMENT_OF_LIGHT_HEAL.id} /> instead.
          </Wrapper>
        )
          .icon(SPELLS.JUDGMENT_OF_LIGHT_HEAL.icon)
          .staticImportance(SUGGESTION_IMPORTANCE.REGULAR);
      });
  }
}

export default JudgmentOfLight;
