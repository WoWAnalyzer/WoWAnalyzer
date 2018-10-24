import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';
import { isStealthOrDance } from '../stealth/IsStealth';

const SHADOW_FOCUS_MULTIPLIER = 0.8;

class SpellEnergyCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.ENERGY;

  discountShadowFocus = false;

  constructor(...args) {
    super(...args);
    this.discountShadowFocus = this.selectedCombatant.hasTalent(SPELLS.SHADOW_FOCUS_TALENT.id);
  }

  getResourceCost(event) {
    const cost = super.getResourceCost(event);
    
    if (this.discountShadowFocus && isStealthOrDance(this.selectedCombatant, 100)) {
      return cost * SHADOW_FOCUS_MULTIPLIER;
    }
    return cost;
  }
}

export default SpellEnergyCost;
