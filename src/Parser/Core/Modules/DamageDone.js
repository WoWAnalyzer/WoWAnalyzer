import Module from 'Parser/Core/Module';

import DamageValue from './DamageValue';

class DamageDone extends Module {
  _total = new DamageValue(); // consider this "protected", so don't change this from other modules. If you want special behavior you must add that code to an extended version of this module.
  get total() {
    return this._total;
  }

  on_byPlayer_damage(event) {
    this._total = this._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);
  }
  on_byPlayer_absorbed(event) {
    this._total = this._total.add(event.amount || 0, event.absorbed || 0, event.overheal || 0);
  }
}

export default DamageDone;
