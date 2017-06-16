import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

class BlindAbsolutionTwoSet extends Module {
  _penanceFirstBolt = false;
  _atonement = new Set([SPELLS.ATONEMENT_HEAL_CRIT.id, SPELLS.ATONEMENT_HEAL_NON_CRIT.id]);

  healing = 0;
  damage = 0;
  
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.DISC_PRIEST_T20_2SET_BONUS_BUFF.id);
    }
  }

  // Speed of the Pious is applied at the start of Penance
  on_byPlayer_applybuff(event) {
    if (event.ability.guid !== SPELLS.SPEED_OF_THE_PIOUS.id) {
      return;
    }

    this._penanceFirstBolt = true;
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PENANCE.id) {
      return;
    }

    if (this._penanceFirstBolt) {
      console.log(event);
      this.damage += (event.amount / 2);
    }
  }

  on_byPlayer_heal(event) {
    if (!this._atonement.has(event.ability.guid)) {
      return;
    }

    if (this._penanceFirstBolt) {
      this.healing += (event.amount + (event.absorbed || 0)) / 2;
      this._penanceFirstBolt = false;
    }
  }
}

export default BlindAbsolutionTwoSet;
