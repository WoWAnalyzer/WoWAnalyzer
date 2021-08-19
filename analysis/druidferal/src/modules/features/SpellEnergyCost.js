import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';

const debug = false;

const INCARN_COST_MULT = 0.8;

class SpellEnergyCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.ENERGY;

  getResourceCost(event) {
    const cost = super.getResourceCost(event);

    // no need to check for Clearcasting as the zero cost is already applied in the log

    if (this.selectedCombatant.hasBuff(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)) {
      debug &&
        console.log(
          `Cost of ${this.event.ability.name} reduced to ${cost * INCARN_COST_MULT} by Incarnation`,
        );
      return cost * INCARN_COST_MULT;
    }

    return cost;
  }
}

export default SpellEnergyCost;
