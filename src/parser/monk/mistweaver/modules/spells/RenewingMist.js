
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';
import Combatants from 'parser/shared/modules/Combatants';


const debug = false;

class RenewingMist extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  totalHealing = 0;
  totalOverhealing = 0;
  totalAbsorbs = 0;
  gustsHealing = 0;
  lastCastTarget = null;
  healingHits = 0;
  numberToCount = 0;


  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;

    if (SPELLS.RENEWING_MIST.id !== spellId) {
      return;
    } 
    if (this.combatants.players[event.targetID]) {
      if (this.combatants.players[event.targetID].hasBuff(SPELLS.ESSENCE_FONT_BUFF.id, event.timestamp, 0, 0) === true) {
        this.numberToCount++;
      }
    }

    this.numberToCount++;
    this.lastCastTarget = event.targetID;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if ((spellId === SPELLS.GUSTS_OF_MISTS.id) && (this.lastCastTarget === event.targetID) && this.numberToCount>0) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
      this.numberToCount--;
    }

    if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      this.totalHealing += event.amount || 0;
      this.totalOverhealing += event.overheal || 0;
      this.totalAbsorbs += event.absorbed || 0;
      this.healingHits += 1;
    }
  }

  on_fightend() {
    if (debug) {
      console.log("gusts rem healing: ", this.gustsHealing);
    }
  }
}

export default RenewingMist;
