import React from 'react';
import SpellLink from 'common/SpellLink';

import Wrapper from 'common/Wrapper';
import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class HealingTouch extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    abilityTracker: AbilityTracker,
  };

  get castsPerMinute() {
    return (this.abilityTracker.getAbility(SPELLS.HEALING_TOUCH.id).casts || 0) / (this.owner.fightDuration / 60000);
  }

  get suggestionThresholds() {
    return {
      actual: this.castsPerMinute,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 2,
      },
      style: 'number',
    };
  }

  suggestions(when) {
    when(this.suggestionThresholds)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<Wrapper><SpellLink id={SPELLS.HEALING_TOUCH.id} /> is inefficient and weak, you should trust your HoTs or your co-healer to top people off. If you have nothing else to do, DPS the boss.</Wrapper>)
          .icon(SPELLS.HEALING_TOUCH.icon)
          .actual(`${(this.castsPerMinute).toFixed(1)} CPM`)
          .recommended(`${(recommended).toFixed(1)} CPM is recommended`);
      });
  }

}

export default HealingTouch;
