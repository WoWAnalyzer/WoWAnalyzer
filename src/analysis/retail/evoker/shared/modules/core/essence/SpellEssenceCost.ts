import { Options } from 'parser/core/EventSubscriber';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';
import TALENTS from 'common/TALENTS/evoker';
import { CastEvent } from 'parser/core/Events';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { DENSE_ENERGY_ESSENCE_REDUCTION } from 'analysis/retail/evoker/devastation/constants';
import { VOLCANISM_ESSENCE_REDUCTION } from 'analysis/retail/evoker/augmentation/constants';

class SpellEssenceCost extends SpellResourceCost {
  static resourceType = RESOURCE_TYPES.ESSENCE;

  hasDenseEnergy: boolean;
  hasVolcanism: boolean;

  constructor(options: Options) {
    super(options);
    this.hasDenseEnergy = this.selectedCombatant.hasTalent(TALENTS.DENSE_ENERGY_TALENT);
    this.hasVolcanism = this.selectedCombatant.hasTalent(TALENTS.VOLCANISM_TALENT);
  }

  getResourceCost(event: CastEvent) {
    let cost = super.getResourceCost(event);

    if (this.hasDenseEnergy && event.ability.guid === TALENTS.PYRE_TALENT.id) {
      cost = Math.max(0, cost - DENSE_ENERGY_ESSENCE_REDUCTION);
    }
    if (this.hasVolcanism && event.ability.guid === TALENTS.ERUPTION_TALENT.id) {
      cost = Math.max(0, cost - VOLCANISM_ESSENCE_REDUCTION);
    }

    return cost;
  }
}

export default SpellEssenceCost;
