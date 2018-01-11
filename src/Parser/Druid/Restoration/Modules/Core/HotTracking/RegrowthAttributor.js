import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import HotTracker from './HotTracker';

const BUFFER_MS = 150; // saw a few cases of taking close to 150ms from cast -> applybuff

const debug = false;

/*
 * Backend module tracks attribution of Regrowth
 */
class RegrowthAttributor extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  // objects hold attribution running totals
  powerOfTheArchdruid = { healing: 0, masteryHealing: 0, procs: 0 }

  // cast tracking stuff
  lastRegrowthCastTimestamp;
  lastRegrowthTarget;
  lastPotaRegrowthTimestamp;
  potaFallTimestamp; // FIXME temp until figure out hasBuff problem
  potaTarget;

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    // set last cast timestamps, used for attribution of HoT applications later
    if (spellId === SPELLS.REGROWTH.id) {
      this.lastRegrowthCastTimestamp = event.timestamp;
      this.lastRegrowthTarget = targetId;
    }

    // check for PotA proc
    //const hadPota = this.combatants.selected.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID_BUFF, null, BUFFER_MS);
    const hadPota = this.potaFallTimestamp && this.potaFallTimestamp + BUFFER_MS > event.timestamp;
    if (spellId === SPELLS.REGROWTH.id && hadPota) {
      this.lastPotaRegrowthTimestamp = event.timestamp;
      this.potaTarget = targetId;
    }
  }

  on_byPlayer_applybuff(event) {
    this._getRegrowthAttribution(event);
  }

  on_byPlayer_refreshbuff(event) {
    this._getRegrowthAttribution(event);
  }

  on_byPlayer_removebuff(event) {
    if(event.ability.guid === SPELLS.POWER_OF_THE_ARCHDRUID_BUFF.id) {
      this.potaFallTimestamp = event.timestamp; // FIXME temp until figure out hasBuff problem
    }
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

    let attName = "None";
    if (event.prepull || (this.lastRegrowthCastTimestamp + BUFFER_MS > timestamp && this.lastRegrowthTarget === targetId)) { // regular cast (assume prepull applications are hardcast)
      // standard hardcast gets no special attribution
      attName = "Hardcast";
    } else if (this.lastPotalRegrowthTimestamp + BUFFER_MS > timestamp && this.potaTarget !== targetId) { // PotA proc but not primary target
      attributions.push(this.powerOfTheArchdruid);
      attName = "Power of the Archdruid";
    } else {
      console.warn(`Unable to attribute Regrowth @${this.owner.formatTimestamp(timestamp)} on ${targetId}`);
    }

    debug && this._logAttribution(spellId, targetId, timestamp, attName);

    attributions.forEach(att => {
      att.procs += 1;
      this.hotTracker.hots[targetId][spellId].attributions.push(att);
    });
  }

  _logAttribution(spellId, targetId, timestamp, attName) {
    debug && console.log(`${spellId} on ${targetId} @${this.owner.formatTimestamp(timestamp)} attributed to ${attName}`);
  }

}

export default RegrowthAttributor;
