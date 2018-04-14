import React from 'react';

import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format'; 

import Analyzer from 'Parser/Core/Analyzer';

import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class HealingSurge extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  get suggestedThreshold(){
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE_RESTORATION.id);

    const twHealingSurges = healingSurge.healingTwHits || 0;
    const healingSurgeCasts = healingSurge.casts || 0;
    const unbuffedHealingSurges = healingSurgeCasts - twHealingSurges;
    const unbuffedHealingSurgesPerc = unbuffedHealingSurges / healingSurgeCasts;
    
    return {
      actual: unbuffedHealingSurgesPerc ,
      isGreaterThan: {
        minor: 0.20,
        average: 0.40,
        major: 0.60,
      },
      style: 'percentage',
    };
  }

  suggestions(when) {
    const suggestedThreshold = this.suggestedThreshold;
    when(suggestedThreshold.actual).isGreaterThan(suggestedThreshold.isGreaterThan.minor)
      .addSuggestion((suggest, actual, recommended) => {
        return suggest(<span>Casting <SpellLink id={SPELLS.HEALING_SURGE_RESTORATION.id} /> without <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} /> is very inefficient, try not to cast more than is necessary.</span>)
          .icon(SPELLS.HEALING_SURGE_RESTORATION.icon)
          .actual(`${formatPercentage(suggestedThreshold.actual)}% of unbuffed Healing Surges`)
          .recommended(`${formatPercentage(suggestedThreshold.isGreaterThan.minor)}% of unbuffed Healing Surges`)
          .regular(suggestedThreshold.isGreaterThan.average).major(suggestedThreshold.isGreaterThan.major);
      });
  }

}

export default HealingSurge;

