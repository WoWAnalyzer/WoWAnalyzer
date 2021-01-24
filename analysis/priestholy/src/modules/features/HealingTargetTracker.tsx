import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';

class HealingTargetTracker extends Analyzer {
  healingDoneToSelf = 0;
  overHealingDoneToSelf = 0;
  healingDoneTotal = 0;
  overHealingDoneTotal = 0;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  get rawHealingDoneToSelf() {
    return this.healingDoneToSelf + this.overHealingDoneToSelf;
  }

  get rawHealingDoneTotal() {
    return this.healingDoneTotal + this.overHealingDoneTotal;
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
