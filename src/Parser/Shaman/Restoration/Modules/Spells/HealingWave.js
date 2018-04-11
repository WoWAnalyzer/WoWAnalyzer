import React from 'react';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import { formatPercentage } from 'common/format'; 
import Combatants from 'Parser/Core/Modules/Combatants';
import AbilityTracker from 'Parser/Core/Modules/AbilityTracker';

class HealingWave extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    combatants: Combatants,
  };

  get suggestedThreshold(){
    const healingWave = this.abilityTracker.getAbility(SPELLS.HEALING_WAVE.id);

    const twHealingWaves = healingWave.healingTwHits || 0;
    const healingWaveCasts = healingWave.casts || 0;
    const unbuffedHealingWaves = healingWaveCasts - twHealingWaves;
    const unbuffedHealingWavesPerc = unbuffedHealingWaves / healingWaveCasts;
    
    return {
      actual: unbuffedHealingWavesPerc ,
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
        return suggest(<span>Casting <SpellLink id={SPELLS.HEALING_WAVE.id} /> without <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} icon/> is slow and generally inefficient. Consider casting a riptide first to generate <SpellLink id={SPELLS.TIDAL_WAVES_BUFF.id} icon/></span>)
          .icon(SPELLS.HEALING_WAVE.icon)
          .actual(`${formatPercentage(suggestedThreshold.actual)}% of unbuffed Healing Waves`)
          .recommended(`${suggestedThreshold.isGreaterThan.minor}% of unbuffed Healing Waves`)
          .regular(suggestedThreshold.isGreaterThan.average).major(suggestedThreshold.isGreaterThan.major);
      });
  }
}

export default HealingWave;
