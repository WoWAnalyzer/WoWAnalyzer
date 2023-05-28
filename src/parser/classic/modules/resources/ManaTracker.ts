import { CastEvent } from 'parser/core/Events';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

class TbcManaTracker extends ManaTracker {
  getAdjustedCost(event: CastEvent) {
    return this.getResource(event)?.cost;
  }
}

export default TbcManaTracker;
