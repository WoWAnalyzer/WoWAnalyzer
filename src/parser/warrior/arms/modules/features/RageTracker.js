import ResourceTracker from 'parser/shared/modules/resourcetracker/ResourceTracker';

import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPELLS from 'common/SPELLS';

const RAGE_PER_MELEE_HIT = 25;

class RageUsage extends ResourceTracker {
    static dependencies = {
		  spellUsable: SpellUsable,
    };

    lastMeleeTaken = 0;
    
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

    on_byPlayer_damage(event) {
      if (event.ability.guid !== SPELLS.MELEE.id) {
        return;
      }      
      this.processInvisibleEnergize(SPELLS.RAGE_AUTO_ATTACKS.id, RAGE_PER_MELEE_HIT);
    }
}

export default RageUsage;