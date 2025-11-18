import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import RestorationAbilityTracker from '../core/RestorationAbilityTracker';

class HealingSurge extends Analyzer {
  static dependencies = {
    abilityTracker: RestorationAbilityTracker,
  };
  protected abilityTracker!: RestorationAbilityTracker;

  get suggestedThreshold() {
    const healingSurge = this.abilityTracker.getAbility(SPELLS.HEALING_SURGE.id);

    const twHealingSurges = healingSurge.healingTwHits || 0;
    const healingSurgeCasts = healingSurge.casts || 0;
    const unbuffedHealingSurges = healingSurgeCasts - twHealingSurges;
    const unbuffedHealingSurgesPerc = unbuffedHealingSurges / healingSurgeCasts;

    return {
      actual: unbuffedHealingSurgesPerc,
      isGreaterThan: {
        minor: 0.2,
        average: 0.4,
        major: 0.6,
      },
      style: 'percentage',
    };
  }
}

export default HealingSurge;
