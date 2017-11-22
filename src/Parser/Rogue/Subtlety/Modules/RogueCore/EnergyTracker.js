import Combatants from 'Parser/Core/Modules/Combatants';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class EnergyTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resource_type = 3;
  }
}

export default EnergyTracker;