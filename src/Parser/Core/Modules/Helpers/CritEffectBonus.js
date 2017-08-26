import ITEMS from 'common/ITEMS';

import Module from 'Parser/Core/Module';

import DRAPE_OF_SHAME_CRIT_EFFECT from '../Items/DRAPE_OF_SHAME_CRIT_EFFECT';

class CritEffectBonus extends Module {
  static BASE_CRIT_EFFECT_MOD = 2;

  hasDrapeOfShame = null;
  on_initialized() {
    this.hasDrapeOfShame = this.owner.selectedCombatant.hasBack(ITEMS.DRAPE_OF_SHAME.id);
  }

  getBonus(event) {
    let critModifier = this.constructor.BASE_CRIT_EFFECT_MOD;
    critModifier += DRAPE_OF_SHAME_CRIT_EFFECT;
    return critModifier;
  }
}

export default CritEffectBonus;
