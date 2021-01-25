import SPELLS from 'common/SPELLS';
import React from 'react';
import { SpellLink } from 'interface';
import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';

import EarlyDotRefreshesCore from './EarlyDotRefreshes';

const MINOR_THRESHOLD = 0.9
const AVERAGE_THRESHOLD = 0.8
const MAJOR_THRESHOLD = 0.6

class EarlyDotRefresh extends EarlyDotRefreshesCore {
  get suggestionThresholdsDeepwoundsEfficiency() {
    return this.makeSuggestionThresholds(SPELLS.MORTAL_STRIKE, MINOR_THRESHOLD, AVERAGE_THRESHOLD, MAJOR_THRESHOLD);
  }

  static dots = [
    {
      name: 'Deepwounds',
      debuffId: SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id,
      castId: SPELLS.MORTAL_STRIKE.id,
      duration: 12000,
    },
  ];

  // Checks the status of the last cast and marks it accordingly.
  getLastBadCastText(event, dot) {
    return super.getLastBadCastText(event, dot);
  }

  suggestions(when) {
    when(this.suggestionThresholdsDeepwoundsEfficiency).addSuggestion((suggest, actual, recommended) => suggest(<>You refreshed <SpellLink id={SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.id} icon /> early {this.suggestionThresholdsDeepwoundsEfficiency.count} times on a target in <SpellLink id={SPELLS.EXECUTE.id} icon /> range. Try to prioritize <SpellLink id={SPELLS.EXECUTE.id} icon /> as it deals more damage than <SpellLink id={SPELLS.MORTAL_STRIKE.id} icon />.</>)
	  .icon(SPELLS.MASTERY_DEEP_WOUNDS_DEBUFF.icon)
      .actual(t({
        id: "shared.suggestions.dots.badRefreshes",
	    message: `${formatPercentage(actual)}% bad dot refreshes.`
	  }))
      .recommended(`<${formatPercentage(recommended)}% is recommended`));
  }

}

export default EarlyDotRefresh;
