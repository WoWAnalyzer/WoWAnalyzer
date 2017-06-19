import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const BUFF_EXPIRATION_BUFFER_MS = 150;
const REGULAR_PENANCE_COOLDOWN_MS = 9000;

class BlindAbsolutionFourSet extends Module {
  _hasProccedInCombat = false; // Proccing before combat will likely be common
  _lastPenanceTimestamp = null;
  _procCount = 0;
  _consumeCount = 0;

  get procs() {
    return this._procCount;
  }

  get consumptions() {
    return this._consumeCount;
  }

  get penanceCooldownSaved() {
    return (this._consumeCount * REGULAR_PENANCE_COOLDOWN_MS) / 2;
  }

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.DISC_PRIEST_T20_4SET_BONUS_PASSIVE.id);
    }
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id) {
      this._hasProccedInCombat = true;
      this._procCount += 1;
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid === SPELLS.PENANCE.id) {
      this._lastPenanceTimestamp = event.timestamp;
    }
  }

  on_toPlayer_removebuff(event) {
    if (event.ability.guid === SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id) {
      if (!this._hasProccedInCombat) {
        this._procCount += 1;
      }

      if ((event.timestamp - BUFF_EXPIRATION_BUFFER_MS) <= this._lastPenanceTimestamp) {
        this._consumeCount += 1;
      }
    }
  }
  
}

export default BlindAbsolutionFourSet;
