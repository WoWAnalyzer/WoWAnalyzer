import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

import SpellResourceCost from 'parser/core/modules/SpellResourceCost';

const debug = false;

const BERSERK_COST_MULTIPLIER = 0.6;

class SpellEnergyCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.ENERGY;

  getResourceCost(event) {
    const cost = super.getResourceCost(event);
    
    // no need to check for Clearcasting as the zero cost is already applied in the log
    // no need to check for T21_4pc as the free bite already shows as free in the log
    
    if (this.selectedCombatant.hasBuff(SPELLS.BERSERK.id) ||
        this.selectedCombatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)) {
      debug && console.log(`Cost of ${this.event.ability.name} reduced to ${cost * BERSERK_COST_MULTIPLIER} by Berserk/Incarnation`);
      return cost * BERSERK_COST_MULTIPLIER;
    }

    return cost;
  }
}

export default SpellEnergyCost;
