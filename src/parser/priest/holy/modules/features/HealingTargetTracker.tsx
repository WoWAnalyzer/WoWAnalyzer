import Analyzer from 'parser/core/Analyzer';
import { HealEvent } from 'parser/core/Events';

class HealingTargetTracker extends Analyzer {
  healingDoneToSelf = 0;
  overHealingDoneToSelf = 0;
  get rawHealingDoneToSelf() {
    return this.healingDoneToSelf + this.overHealingDoneToSelf;
  }

  healingDoneTotal = 0;
  overHealingDoneTotal = 0;
  get rawHealingDoneTotal() {
    return this.healingDoneTotal + this.overHealingDoneTotal;
  }

  on_byPlayer_heal(event: HealEvent) {
    if (event.targetID === this.owner.playerId) {
      this.healingDoneToSelf += event.amount;
      this.overHealingDoneToSelf += event.overheal || 0;
    }
    this.healingDoneTotal += event.amount;
    this.overHealingDoneTotal += event.overheal || 0;
  }
}

export default HealingTargetTracker;
