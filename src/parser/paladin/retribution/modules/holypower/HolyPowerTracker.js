import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';
import SPELLS from 'common/SPELLS';

class HolyPowerTracker extends ResourceTracker {
  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.HOLY_POWER;
  }

  getReducedCost(event) {
    if (!this.getResource(event).cost) {
      return 0;
    }
    let cost = this.getResource(event).cost;
    if (this.selectedCombatant.hasBuff(SPELLS.THE_FIRES_OF_JUSTICE_BUFF.id)) {
      cost = cost - 1;
    }
    return cost;
  }
}

export default HolyPowerTracker;
