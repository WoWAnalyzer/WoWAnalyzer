import { CastEvent } from 'parser/core/Events';
import ManaTracker from 'parser/core/healingEfficiency/ManaTracker';

class TbcManaTracker extends ManaTracker {
  getReducedCost(event: CastEvent) {
    return this.getResource(event)?.cost;
  }
}

export default TbcManaTracker;
