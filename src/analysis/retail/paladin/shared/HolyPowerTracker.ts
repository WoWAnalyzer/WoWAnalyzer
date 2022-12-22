import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import { Options } from 'parser/core/Analyzer';
import { CastEvent } from 'parser/core/Events';

class HolyPowerTracker extends ResourceTracker {
  constructor(options: Options) {
    super(options);
    this.resource = RESOURCE_TYPES.HOLY_POWER;
  }

  getAdjustedCost(event: CastEvent) {
    let cost = this.getResource(event)?.cost ?? 0;
    if (!cost) {
      return 0;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.FIRES_OF_JUSTICE_BUFF.id)) {
      cost = cost - 1;
    }
    return cost;
  }
}

export default HolyPowerTracker;
