
import SPELLS from 'common/SPELLS';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';

class RenewingMist extends Analyzer {
  constructor(...args) {
    super(...args);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST), this.castRenewingMist);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS), this.handleGustsOfMists);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.RENEWING_MIST_HEAL), this.handleRenewingMist);
  }

  totalHealing = 0;
  totalOverhealing = 0;
  totalAbsorbs = 0;
  gustsHealing = 0;
  lastCastTarget = null;
  healingHits = 0;
  numberToCount = 0;

  castRenewingMist(event) {
    this.numberToCount += 1;
    this.lastCastTarget = event.targetID;
  }

  handleGustsOfMists(event) {
    if ((this.lastCastTarget === event.targetID) && this.numberToCount>0) {
      this.gustsHealing += (event.amount || 0) + (event.absorbed || 0);
      this.numberToCount -= 1;
    }
  }

  handleRenewingMist(event) {
    this.totalHealing += event.amount || 0;
    this.totalOverhealing += event.overheal || 0;
    this.totalAbsorbs += event.absorbed || 0;
    this.healingHits += 1;
  }
}

export default RenewingMist;
