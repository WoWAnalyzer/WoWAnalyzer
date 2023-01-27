import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';
import TALENTS from 'common/TALENTS/rogue';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';

import { isStealthOrDance } from './IsStealth';

const SHADOW_FOCUS_MULTIPLIER = 0.8;

class SpellEnergyCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.ENERGY;

  discountShadowFocus = false;

  constructor(options: Options) {
    super(options);
    this.discountShadowFocus = this.selectedCombatant.hasTalent(TALENTS.SHADOW_FOCUS_TALENT);
  }

  getResourceCost(event: CastEvent) {
    const cost = super.getResourceCost(event);

    if (this.discountShadowFocus && isStealthOrDance(this.selectedCombatant, 100)) {
      return cost * SHADOW_FOCUS_MULTIPLIER;
    }
    return cost;
  }
}

export default SpellEnergyCost;
