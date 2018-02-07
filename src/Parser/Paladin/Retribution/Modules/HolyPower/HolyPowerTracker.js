import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';
import SPELLS from 'common/SPELLS';

class HolyPowerTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resourceType = RESOURCE_TYPES.HOLY_POWER.id;
    this.resourceName = 'Holy Power';
  }

  getReducedCost(event) {
    if(!this.getResource(event).cost) {
      return 0;
    }
    let cost = this.getResource(event).cost;
    if(this.combatants.selected.hasBuff(SPELLS.THE_FIRES_OF_JUSTICE_BUFF.id) || SPELLS.RET_PALADIN_T21_4SET_BONUS_BUFF.id) {
      cost = cost - 1;
    }
  }
}

export default HolyPowerTracker;