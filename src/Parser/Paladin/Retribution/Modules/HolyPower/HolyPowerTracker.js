import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import SPELLS from 'common/SPELLS';

class HolyPowerTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resource = RESOURCE_TYPES.HOLY_POWER;
  }

  getReducedCost(event) {
    if(!this.getResource(event).cost) {
      return 0;
    }
    let cost = this.getResource(event).cost;
    if(this.combatants.selected.hasBuff(SPELLS.THE_FIRES_OF_JUSTICE_BUFF.id) || this.combatants.selected.hasBuff(SPELLS.RET_PALADIN_T21_4SET_BONUS_BUFF.id)) {
      cost = cost - 1;
    }
    return cost;
  }
}

export default HolyPowerTracker;