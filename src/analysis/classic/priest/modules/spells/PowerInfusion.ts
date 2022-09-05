import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import * as SPELLS from '../../SPELLS';

class PowerInfusion extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  protected abilityTracker!: AbilityTracker;

  get castCount() {
    return this.abilityTracker.getAbility(SPELLS.POWER_INFUSION).casts;
  }

  get hasPowerInfusion(): boolean {
    return this.selectedCombatant.talents[0] >= 31;
  }
}

export default PowerInfusion;
