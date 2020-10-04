import Analyzer from 'parser/core/Analyzer';
import { HealEvent } from 'parser/core/Events';

class HealingReceived extends Analyzer {
  HealingReceivedExternal = 0;
  HealingReceivedSelf = 0;

  on_toPlayer_heal(event: HealEvent) {
    if (event.sourceID === this.owner.playerId) {
      this.HealingReceivedSelf += event.amount;
    } else {
      this.HealingReceivedExternal += event.amount;
    }
  }
}

export default HealingReceived;
