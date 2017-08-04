import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class AtonementSource extends Module {
  _previousDamageEvent = null;
  _previousAtonementApplicator = null;
  _previousAtonementApplicatorEvent = null;

  // Spells that will apply atonement
  atonementApplicators = new Map([
    [SPELLS.POWER_WORD_RADIANCE.id, SPELLS.POWER_WORD_RADIANCE.atonementDuration],
    [SPELLS.POWER_WORD_SHIELD.id, SPELLS.POWER_WORD_SHIELD.atonementDuration],
    [SPELLS.PLEA.id, SPELLS.PLEA.atonementDuration],
    [SPELLS.SHADOW_MEND.id, SPELLS.SHADOW_MEND.atonementDuration],
  ]);

  get atonementDuration() {
    return this.atonementApplicators;
  }

  get atonementDamageSource() {
    return this._previousDamageEvent;
  }

  get atonementApplicationSource() {
    return this._previousAtonementApplicator;
  }

  get atonementApplicationSourceEvent() {
    return this._previousAtonementApplicatorEvent;
  }

  on_byPlayer_heal(event) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._previousAtonementApplicator = event.ability.guid;
      this._previousAtonementApplicatorEvent = event;
    }
  }
  
  on_byPlayer_applybuff(event) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._previousAtonementApplicator = event.ability.guid;
      this._previousAtonementApplicatorEvent = event;
    }
  }

  on_byPlayer_damage(event) {
    // Some Atonement events have the type 'damage', this prevents them registering as a source
    if (event.ability.guid === SPELLS.ATONEMENT_HEAL_NON_CRIT.id) {
      return;
    }
    this._previousDamageEvent = event;
  }
}

export default AtonementSource;
