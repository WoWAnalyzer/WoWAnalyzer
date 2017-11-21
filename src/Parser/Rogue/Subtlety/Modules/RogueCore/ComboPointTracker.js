import Combatants from 'Parser/Core/Modules/Combatants';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.constructor.RESOURCE_TYPE = 4;
    this.constructor.MAX = 6;
  }
}

export default ComboPointTracker;