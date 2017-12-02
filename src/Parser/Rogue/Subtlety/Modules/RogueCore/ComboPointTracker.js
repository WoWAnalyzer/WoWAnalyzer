import Combatants from 'Parser/Core/Modules/Combatants';
import ResourceTypes from 'common/RESOURCE_TYPES';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resourceType = ResourceTypes.COMBO_POINTS;
    this.resourceName = "Combo Points";
  }
}

export default ComboPointTracker;