import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';

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
        minor: 0.0,
        average: 0.20,
        major: 0.40,
      },
      style: 'percentage',
    };
    

  }
}

export default HealingWave;

