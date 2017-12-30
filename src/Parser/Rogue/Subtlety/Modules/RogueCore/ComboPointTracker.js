import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resourceType = RESOURCE_TYPES.COMBO_POINTS;
    this.resourceName = 'Combo Points';
  }
}

export default ComboPointTracker;
