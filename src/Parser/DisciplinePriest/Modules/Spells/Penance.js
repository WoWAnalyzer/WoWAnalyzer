import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

/* This module will try to use Speed of the Pious to determine new Penance casts
 * If Speed of the Pious is not available, we fallback to an estimate
 */

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

class Penance extends Module {
  priority = 9;

  _speedOfThePiousAcquired = false;
  _previousPenanceTimestamp = null;
  _penanceFirstBolt = false;

  isNewPenanceCast(timestamp) {
    return !this._previousPenanceTimestamp || (timestamp - this._previousPenanceTimestamp) > PENANCE_MINIMUM_RECAST_TIME;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if ((spellId !== SPELLS.PENANCE.id && spellId !== SPELLS.PENANCE_HEAL.id) || this._speedOfThePiousAcquired) {
      return;
    }

    if (this.isNewPenanceCast(event.timestamp)) {
      this._previousPenanceTimestamp = event.timestamp;
      this._penanceFirstBolt = true;
    }
  }

  // Speed of the Pious is applied at the start of Penance
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SPEED_OF_THE_PIOUS.id) {
      return;
    }
    this._speedOfThePiousAcquired = true;
    this._penanceFirstBolt = true;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PENANCE.id) {
      return;
    }

    if (this._penanceFirstBolt) {
      event.isFirstPenanceBolt = true;
      this._penanceFirstBolt = false;
    }
  }

  on_byPlayer_heal(event) {
    if (event.ability.guid !== SPELLS.PENANCE_HEAL.id) {
      return;
    }

    if (this._penanceFirstBolt) {
      event.isFirstPenanceBolt = true;
      this._penanceFirstBolt = false;
    }
  }
}

export default Penance;
