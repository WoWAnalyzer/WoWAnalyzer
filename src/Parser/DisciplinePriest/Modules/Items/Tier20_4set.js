import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const BUFF_EXPIRATION_BUFFER = 150; // Buffer for detecting buff fade
const PENANCE_COOLDOWN = 9000; // Penance CD in MS

class Tier20_4set extends Module {
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
    return (this._consumeCount * PENANCE_COOLDOWN) / 2;
  }

  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.DISC_PRIEST_T20_4SET_BONUS_PASSIVE.id);
    }
  }

  on_byPlayer_combatantinfo(event) {
    const fourSetAura = event.auras
      .filter(aura => aura.ability === SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id);
    
    this._procCount += fourSetAura ? 1 : 0;
  }

  on_toPlayer_applybuff(event) {
    if (event.ability.guid === SPELLS.DISC_PRIEST_T20_4SET_BONUS_BUFF.id) {
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
      if ((event.timestamp - BUFF_EXPIRATION_BUFFER) <= this._lastPenanceTimestamp) {
        this._consumeCount += 1;
      }
    }
  }
  
}

export default Tier20_4set;
