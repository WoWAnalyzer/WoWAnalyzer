import Module from 'Parser/Core/Module';

import HealingValue from './HealingValue';

import ManaValues from './ManaValues';

class HealingDone extends Module {
  static dependencies = {
    manaValues: ManaValues,
  };

  _total = new HealingValue(); // consider this "protected", so don't change this from other modules. If you want special behavior you must add that code to an extended version of this module.
  get total() {
    return this._total;
  }
  bySecond = {};

  on_byPlayer_heal(event) {
    this._addHealing(event.timestamp, event.amount, event.absorbed, event.overheal);
  }
  on_byPlayer_absorbed(event) {
    this._addHealing(event.timestamp, 0, event.amount, 0);
  }
  on_byPlayer_removebuff(event) {
    if (event.absorb) {
      this._addHealing(event.timestamp, 0, 0, event.absorb);
    }
  }

  _addHealing(timestamp, amount = 0, absorbed = 0, overheal = 0) {
    this._total = this._total.add(amount, absorbed, overheal);
    // TODO: byAbility
    const secondsIntoFight = Math.floor((timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || new HealingValue()).add(amount, absorbed, overheal);
  }
  _subtractHealing(timestamp, amount = 0, absorbed = 0, overkill = 0) {
    return this._addHealing(timestamp, -amount, -absorbed, -overkill);
  }
}

export default HealingDone;
