
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';

const debug = false;

class RenewingMist extends Analyzer {
  static dependencies = {
  };

  totalHealing = 0;
  totalOverhealing = 0;
  totalAbsorbs = 0;
  gustsHealing = 0;
  lastCastTarget = null;
  healingHits = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (SPELLS.VIVIFY.id !== spellId) {
      return;
    }
    this.lastCastTarget = event.targetID;
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if ((spellId === SPELLS.GUSTS_OF_MISTS.id) && (this.lastCastTarget === event.targetID)) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
    }

    if (spellId === SPELLS.RENEWING_MIST_HEAL.id) {
      this.totalHealing += event.amount || 0;
      this.totalOverhealing += event.overheal || 0;
      this.totalAbsorbs += event.absorbed || 0;
      this.healingHits += 1;
    }
  }

  on_finished() {
    if (debug) {
      //if needed
    }
  }
}

export default RenewingMist;
