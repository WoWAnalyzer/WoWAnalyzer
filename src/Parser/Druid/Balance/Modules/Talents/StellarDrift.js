import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';
import SUGGESTION_IMPORTANCE from 'Parser/Core/ISSUE_IMPORTANCE';

class StellarDrift extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  hasOnethsIntuition = false;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.STELLAR_DRIFT_TALENT.id);
    this.hasOnethsIntuition = this.combatants.selected.hasWrists(ITEMS.ONETHS_INTUITION.id);
  }

  get usedStarfall(){
    if (this.abilityTracker.getAbility(SPELLS.STARFALL_CAST.id).casts) {
      return true;
    }
    return this.hasOnethsIntuition;
  }

  get suggestionThresholds() {
    return {
      actual: this.usedStarfall,
      isEqual: false,
      style: 'boolean',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds).isFalse().addSuggestion((suggest) => {
      return suggest(<Wrapper>You did not gain any benefit from <SpellLink id={SPELLS.STELLAR_DRIFT_TALENT.id} />. If you are not casting <SpellLink id={SPELLS.STARFALL_CAST.id} />, it is recommended to use <SpellLink id={SPELLS.NATURES_BALANCE_TALENT.id} />.</Wrapper>)
        .icon(SPELLS.STELLAR_DRIFT_TALENT.icon)
        .staticImportance(SUGGESTION_IMPORTANCE.MAJOR);
    });
  }
}

export default StellarDrift;
