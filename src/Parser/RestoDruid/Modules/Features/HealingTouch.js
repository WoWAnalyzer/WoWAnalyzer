import React from 'react';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SuggestionThresholds from '../../SuggestionThresholds';

const MS_PER_MINUTE = 60000;

class HealingTouch extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;
    const hts = abilityTracker.getAbility(SPELLS.HEALING_TOUCH.id).casts || 0;
    const htsPerMinute = hts / this.owner.fightDuration * MS_PER_MINUTE;

    when(htsPerMinute).isGreaterThan(SuggestionThresholds.HTS_PER_MINUTE.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span><SpellLink id={SPELLS.HEALING_TOUCH.id} /> is an inefficient spell to cast. You should trust your co-healer to top people off, if you got nothing to do you can always dps.</span>)
          .icon(SPELLS.HEALING_TOUCH.icon)
          .actual(`${(htsPerMinute).toFixed(1)} CPM`)
          .recommended(`>${(recommended).toFixed(1)} CPM is recommended`)
          .regular(SuggestionThresholds.HTS_PER_MINUTE.regular).major(SuggestionThresholds.HTS_PER_MINUTE.major);
      });
  }

}

export default HealingTouch;
