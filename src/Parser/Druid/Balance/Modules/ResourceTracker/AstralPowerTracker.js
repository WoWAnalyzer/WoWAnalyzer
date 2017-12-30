import Combatants from 'Parser/Core/Modules/Combatants';
import RESOURCE_TYPES from 'common/RESOURCE_TYPES';

import ResourceTracker from 'Parser/Rogue/Subtlety/Modules/ResourceTracker/ResourceTracker';

class AstralPowerTracker extends ResourceTracker {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.resourceType = RESOURCE_TYPES.ASTRAL_POWER.id;
    this.resourceName = 'Astral Power';
  }
}

export default AstralPowerTracker;