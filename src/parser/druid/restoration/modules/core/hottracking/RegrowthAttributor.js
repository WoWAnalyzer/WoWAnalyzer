import SPELLS from 'common/SPELLS';
import Analyzer from 'parser/core/Analyzer';

import HotTracker from './HotTracker';

const BUFFER_MS = 150; // saw a few cases of taking close to 150ms from cast -> applybuff
/*
 * Backend module tracks attribution of Regrowth
 * TODO - Dead module?
 */
class RegrowthAttributor extends Analyzer {
  static dependencies = {
    hotTracker: HotTracker,
  };


  // cast tracking stuff
  lastRegrowthCastTimestamp;
  lastRegrowthTarget;

  totalNonCCRegrowthHealing = 0;
  totalNonCCRegrowthOverhealing = 0;
  totalNonCCRegrowthAbsorbs = 0;
  totalNonCCRegrowthHealingTicks = 0;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    // set last cast timestamps, used for attribution of HoT applications later
    if (spellId === SPELLS.REGROWTH.id) {
      this.lastRegrowthCastTimestamp = event.timestamp;
      this.lastRegrowthTarget = targetId;
    }
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.REGROWTH.id) {
      return;
    }

    if(!this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_BUFF.id, event.timestamp, BUFFER_MS)) {
      this.totalNonCCRegrowthHealing += event.amount;
      this.totalNonCCRegrowthOverhealing += event.overheal || 0;
      this.totalNonCCRegrowthAbsorbs += event.absorbed || 0;
      if(event.tick) {
        this.totalNonCCRegrowthHealingTicks += 1;
      }
    }
  }

  on_byPlayer_applybuff(event) {
    this._getRegrowthAttribution(event);
  }

  on_byPlayer_refreshbuff(event) {
    this._getRegrowthAttribution(event);
  }

  // gets attribution for a given applybuff/refreshbuff of Regrowth
  _getRegrowthAttribution(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (spellId !== SPELLS.REGROWTH.id) {
      return;
    }
    if(!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const timestamp = event.timestamp;
    const attributions = [];

    if (event.prepull || (this.lastRegrowthCastTimestamp + BUFFER_MS > timestamp && this.lastRegrowthTarget === targetId)) { // regular cast (assume prepull applications are hardcast)
      // standard hardcast gets no special attribution
    } else {
      console.warn(`Unable to attribute Regrowth @${this.owner.formatTimestamp(timestamp)} on ${targetId}`);
    }

    attributions.forEach(att => {
      this.hotTracker.addAttribution(att, targetId, spellId);
    });
  }

}

export default RegrowthAttributor;
