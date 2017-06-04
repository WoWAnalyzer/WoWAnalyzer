import Module from 'Parser/Core/Module';

class AtonementDamageSource extends Module {
  _previousDamageEvent = null;

  get event() {
    return this._previousDamageEvent;
  }

  get spell() {
    return this._previousDamageEvent.ability;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid === 81751) {
      return;
    }
    this._previousDamageEvent = event;
  }
}

export default AtonementDamageSource;
