import React from 'react';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';

import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';

import SuggestionThresholds from '../../SuggestionThresholds';

class WildGrowth extends Analyzer {
  suggestions(when) {
    const abilityTracker = this.owner.modules.abilityTracker;
    const rejuvs = abilityTracker.getAbility(SPELLS.REJUVENATION.id).casts || 0;
    const wgs = abilityTracker.getAbility(SPELLS.WILD_GROWTH.id).casts || 0;
    const wgsPerRejuv = (wgs / rejuvs) || 0;

    when(wgsPerRejuv).isLessThan(SuggestionThresholds.WGS_PER_REJUV.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Your <SpellLink id={SPELLS.WILD_GROWTH.id} /> to rejuv ratio can be improved, try to cast more wild growths if possible as it is usually more efficient.</span>,)
          .icon(SPELLS.WILD_GROWTH.icon)
          .actual(`${wgs} WGs / ${rejuvs} rejuvs`)
          .recommended(`>${Math.round(formatPercentage(recommended))}% is recommended`)
          .regular(SuggestionThresholds.WGS_PER_REJUV.regular).major(SuggestionThresholds.WGS_PER_REJUV.major);
      });
  }
}

export default WildGrowth;
