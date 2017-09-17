import Module from 'Parser/Core/Module';

import HealingValue from './HealingValue';

class HealingDone extends Module {
  _total = new HealingValue(); // consider this "protected", so don't change this from other modules. If you want special behavior you must add that code to an extended version of this module.
  get total() {
    return this._total;
  }

  bySecond = {};

  _byAbility = {};
  byAbility(spellId) {
    if (!this._byAbility[spellId]) {
      return new HealingValue(0, 0, 0);
    } else {
      return this._byAbility[spellId];
    }
  }

  on_heal(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      this._addHealing(event, event.amount, event.absorbed, event.overheal);
    }
  }
  on_absorbed(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      this._addHealing(event, 0, event.amount, 0);
    }
  }
  on_removebuff(event) {
    if (this.owner.byPlayer(event) || this.owner.byPlayerPet(event)) {
      if (event.absorb) {
        this._addHealing(event, 0, 0, event.absorb);
      }
    }
  }

  _addHealing(event, amount = 0, absorbed = 0, overheal = 0) {
    this._total = this._total.add(amount, absorbed, overheal);

    const spellId = event.ability.guid;
    if (this._byAbility[spellId]) {
      this._byAbility[spellId] = this._byAbility[spellId].add(amount, absorbed, overheal);
    } else {
      this._byAbility[spellId] = new HealingValue(amount, absorbed, overheal);
    }

    const secondsIntoFight = Math.floor((event.timestamp - this.owner.fight.start_time) / 1000);
    this.bySecond[secondsIntoFight] = (this.bySecond[secondsIntoFight] || new HealingValue()).add(amount, absorbed, overheal);
  }
  _subtractHealing(event, amount = 0, absorbed = 0, overheal = 0) {
    return this._addHealing(event, -amount, -absorbed, -overheal);
  }
}

export default HealingDone;
