import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class AtonementSource extends Module {
  _previousDamageEvent = null;
  _previousAtonementApplicator = null;

  // Spells that will apply atonement
  atonementApplicators = new Set([
    SPELLS.POWER_WORD_RADIANCE.id,
    SPELLS.POWER_WORD_SHIELD.id,
    SPELLS.PLEA.id,
    SPELLS.SHADOW_MEND.id,
  ]);

  get atonementDamageSource() {
    return this._previousDamageEvent;
  }

  get atonementApplicationSource() {
    return this._previousAtonementApplicator;
  }

  on_byPlayer_heal(event) {
    if (this.atonementApplicators.has(event.ability.guid)) {
      this._previousAtonementApplicator = event.ability.guid;
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
