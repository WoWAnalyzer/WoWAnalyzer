import Combatants from 'Parser/Core/Modules/Combatants';

import ResourceTracker from '../ResourceTracker/ResourceTracker';

class ComboPointTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resource_type = 4;
  }
}

export default ComboPointTracker;