import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';

// TODO: Add rage gen from melee 

class RageUsage extends ResourceTracker {
    static dependencies = {
		  spellUsable: SpellUsable,
    };
    
    constructor(...args) {
      super(...args);
      this.resource = RESOURCE_TYPES.RAGE;
    }

    getReducedCost(event) {
      if (!this.getResource(event).cost) {
        return 0;
      }
      const cost = this.getResource(event).cost / 10;
      return cost;
    }
}

export default RageUsage;