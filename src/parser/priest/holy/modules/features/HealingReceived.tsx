import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';

class HealingReceived extends Analyzer {
  HealingReceivedExternal = 0;
  HealingReceivedSelf = 0;

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.heal.to(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (event.sourceID === this.owner.playerId) {
      this.HealingReceivedSelf += event.amount;
    } else {
      this.HealingReceivedExternal += event.amount;
    }
  }
}

export default HealingReceived;
