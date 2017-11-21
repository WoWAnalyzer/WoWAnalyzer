import Combatants from 'Parser/Core/Modules/Combatants';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class EnergyTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.constructor.RESOURCE_TYPE = 3;
    this.constructor.MAX = 100;
  }
}

export default EnergyTracker;