import TALENTS from 'common/TALENTS/warrior';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';

class RageTracker extends ResourceTracker {
  lastMeleeTaken = 0;

  maxResource = 100;

  ragePerMeleeHit: number = 2;

  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.RAGE;
    if (this.selectedCombatant.hasTalent(TALENTS.WAR_MACHINE_TALENT)) {
      this.ragePerMeleeHit += 1;
    }
  }

  getAdjustedCost(event: CastEvent) {
    if (event.resourceCost && event.resourceCost[this.resource.id] !== undefined) {
      return event.resourceCost[this.resource.id];
    }
    const resource = super.getResource(event);
    if (!resource) {
      return;
    }
    return resource.cost ? resource.cost / 10 : 0;
  }
}

export default RageTracker;
