import Combatants from 'Parser/Core/Modules/Combatants';
import ResourceTypes from 'common/RESOURCE_TYPES';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class EnergyTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resourceType = ResourceTypes.ENERGY;
    this.resourceName = "Energy";
  }
}

export default EnergyTracker;