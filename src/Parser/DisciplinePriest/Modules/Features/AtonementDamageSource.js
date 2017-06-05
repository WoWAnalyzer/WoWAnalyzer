import SPELLS from 'common/SPELLS';

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
    // Some Atonement events have the type 'damage', this prevents them registering as a source
    if (event.ability.guid === SPELLS.ATONEMENT_HEAL_NON_CRIT.id) {
      return;
    }
    this._previousDamageEvent = event;
  }
}

export default AtonementDamageSource;
