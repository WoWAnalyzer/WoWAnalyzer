import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

import isAtonement from '../Core/isAtonement';
import Penance from '../Spells/Penance';

const TIER_20_TWO_SET_BONUS = 1;

class Tier20_2set extends Module {
  static dependencies = {
    penance: Penance, // we need this to add `penanceBoltNumber` to the damage and heal events
  };

  _secondPenanceBoltLastDamageEvent = false;

  healing = 0;
  damage = 0;
  
  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T20_2SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PENANCE.id || event.penanceBoltNumber !== 1) {
      this._secondPenanceBoltLastDamageEvent = false;
      return;
    }

    this._secondPenanceBoltLastDamageEvent = true;
    this.damage += (event.amount / 2);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.PENANCE_HEAL.id) {
      if (event.penanceBoltNumber === 1) {
        this.healing += calculateEffectiveHealing(event, TIER_20_TWO_SET_BONUS);
      }
    }

    // Atonement
    if (isAtonement(event)) {
      if (this._secondPenanceBoltLastDamageEvent) {
        this.healing += calculateEffectiveHealing(event, TIER_20_TWO_SET_BONUS);
      }
    }
  }
}

export default Tier20_2set;
