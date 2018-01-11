import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import HotTracker from './HotTracker';

const REJUV_IDS = [
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
];

const BUFFER_MS = 150; // saw a few cases of taking close to 150ms from cast -> applybuff

const debug = false;

/*
 * Backend module tracks attribution of Rejuvenations
 */
class RejuvenationAttributor extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    hotTracker: HotTracker,
  };

  // objects hold attribution running totals
  powerOfTheArchdruid = { healing: 0, masteryHealing: 0, dreamwalkerHealing: 0, procs: 0 };
  tearstoneOfElune = { healing: 0, masteryHealing: 0, dreamwalkerHealing: 0, procs: 0 };
  t194p = { healing: 0, masteryHealing: 0, dreamwalkerHealing: 0, procs: 0 };

  // cast tracking stuff
  lastRejuvCastTimestamp;
  lastRejuvTarget;
  lastWildGrowthCastTimestamp

  // PotA tracking stuff
  lastPotaRejuvTimestamp;
  potaFallTimestamp; // FIXME temp until figure out hasBuff problem
  potaTarget;

  // Tearstone tracking stuff
  lastWildgrowthTimestamp;
  hasTearstone;

  // 4T19 tracking stuff
  has4t19;

  on_initialized() {
    this.hasTearstone = this.combatants.selected.hasFinger(ITEMS.TEARSTONE_OF_ELUNE.id);
    this.has4t19 = this.combatants.selected.hasBuff(SPELLS.RESTO_DRUID_T19_4SET_BONUS_BUFF.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    // set last cast timestamps, used for attribution of HoT applications later
    if (spellId === SPELLS.REJUVENATION.id) {
      this.lastRejuvCastTimestamp = event.timestamp;
      this.lastRejuvTarget = targetId;
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      this.lastWildGrowthCastTimestamp = event.timestamp;
    }

    // check for PotA proc
    //const hadPota = this.combatants.selected.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID_BUFF, null, BUFFER_MS);
    const hadPota = this.potaFallTimestamp && this.potaFallTimestamp + BUFFER_MS > event.timestamp;
    if (spellId === SPELLS.REJUVENATION.id && hadPota) {
      this.lastPotaRejuvTimestamp = event.timestamp;
      this.potaTarget = targetId;
    }
  }

  on_byPlayer_applybuff(event) {
    this._getRejuvAttribution(event);
  }

  on_byPlayer_refreshbuff(event) {
    this._getRejuvAttribution(event);
  }

  on_byPlayer_removebuff(event) {
    if(event.ability.guid === SPELLS.POWER_OF_THE_ARCHDRUID_BUFF.id) {
      this.potaFallTimestamp = event.timestamp; // FIXME temp until figure out hasBuff problem
    }
  }

  // gets attribution for a given applybuff/refreshbuff of Rejuvenation or Germination
  _getRejuvAttribution(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!REJUV_IDS.includes(spellId)) {
      return;
    }
    if(!this.hotTracker.hots[targetId] || !this.hotTracker.hots[targetId][spellId]) {
      return;
    }

    const timestamp = event.timestamp;
    const attributions = [];

    let attName = "None";
    if (event.prepull || (this.lastRejuvCastTimestamp + BUFFER_MS > timestamp && this.lastRejuvTarget === targetId)) { // regular cast (assume prepull applications are hardcast)
      // standard hardcast gets no special attribution
      attName = "Hardcast";
    } else if (this.lastPotaRejuvTimestamp + BUFFER_MS > timestamp && this.potaTarget !== targetId) { // PotA proc but not primary target
      attributions.push(this.powerOfTheArchdruid);
      attName = "Power of the Archdruid";
    } else if (this.hasTearstone && this.lastWildGrowthCastTimestamp + BUFFER_MS > timestamp) {
      attributions.push(this.tearstoneOfElune);
      attName = "Tearstone of Elune";
    } else if (this.has4t19) {
      attributions.push(this.t194p);
      attName = "Tier19 4pc";
    } else {
      console.warn(`Unable to attribute Rejuv @${this.owner.formatTimestamp(timestamp)} on ${targetId}`);
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

export default RejuvenationAttributor;
