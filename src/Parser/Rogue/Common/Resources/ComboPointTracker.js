import RESOURCE_TYPES from 'common/RESOURCE_TYPES';
import Combatants from 'Parser/Core/Modules/Combatants';

import ResourceTracker from 'Parser/Core/Modules/ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  constructor(...args) {
    super(...args);
    this.resource = RESOURCE_TYPES.COMBO_POINTS;
  }
}

export default ComboPointTracker;
