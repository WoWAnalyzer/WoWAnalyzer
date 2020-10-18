import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';

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
  
  constructor(options: Options){
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  onHeal(event: HealEvent) {
    if (event.targetID === this.owner.playerId) {
      this.healingDoneToSelf += event.amount;
      this.overHealingDoneToSelf += event.overheal || 0;
    }
    this.healingDoneTotal += event.amount;
    this.overHealingDoneTotal += event.overheal || 0;
  }
}

export default HealingTargetTracker;
