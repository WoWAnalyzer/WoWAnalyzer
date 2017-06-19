import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';

const TIER_20_TWO_SET_BONUS = 1;

class Tier20_2set extends Module {
  _firstPenanceBoltLastDamageEvent = false;

  healing = 0;
  damage = 0;
  
  on_initialized() {
    if (!this.owner.error) {
      this.active = this.owner.selectedCombatant.hasBuff(SPELLS.DISC_PRIEST_T20_2SET_BONUS_PASSIVE.id);
    }
  }

  on_byPlayer_damage(event) {
    if (event.ability.guid !== SPELLS.PENANCE.id || !event.isFirstPenanceBolt) {
      this._firstPenanceBoltLastDamageEvent = false;
      return;
    }

    this._firstPenanceBoltLastDamageEvent = true;
    this.damage += (event.amount / 2);
  }

  on_byPlayer_heal(event) {
    // Healing Penance first bolt
    if (event.isFirstPenanceBolt) {
      this.healing += calculateEffectiveHealing(event, TIER_20_TWO_SET_BONUS);
    }

    // Atonement
    if (event.isAtonementHeal) {
      if (this._firstPenanceBoltLastDamageEvent) {
        this.healing += calculateEffectiveHealing(event, TIER_20_TWO_SET_BONUS);
      }
    }
  }
}

export default Tier20_2set;
