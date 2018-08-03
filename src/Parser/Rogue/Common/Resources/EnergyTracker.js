import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';

import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import {isStealthOrDance} from '../Stealth/IsStealth';

const SHADOW_FOCUS_MULTIPLIER = 0.8;

class EnergyTracker extends ResourceTracker {

  discountShadowFocus = false;
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.ENERGY;
    this.discountShadowFocus = this.selectedCombatant.hasTalent(SPELLS.SHADOW_FOCUS_TALENT.id);
  }
  
  getReducedCost(event) {
    const cost = super.getReducedCost(event);
    if (!cost) {
      return 0;
    }
    if(this.discountShadowFocus && isStealthOrDance(this.selectedCombatant,100)) {
      return cost * SHADOW_FOCUS_MULTIPLIER;
    }

    return cost;
  }
}

export default EnergyTracker;
