import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const BUFFER_MS = 100;

const debug = false;

/*
 * Backend module for tracking attribution of HoTs, e.g. what applied them / applied parts of them / boosted them
 */
class Rejuvenation extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  // HoTs to track, duration, tick frequency
  hotInfo = {
    [SPELLS.REJUVENATION.id]: {
      duration: 15000 + (1000 * this.combatants.selected.traitsBySpellId[SPELLS.PERSISTENCE_TRAIT.id]),
      tickPeriod: 3000,
    },
    [SPELLS.REJUVENATION_GERMINATION.id]: {
      duration: 15000 + (1000 * this.combatants.selected.traitsBySpellId[SPELLS.PERSISTENCE_TRAIT.id]),
      tickPeriod: 3000,
    },
    [SPELLS.REGROWTH.id]: {
      duration: 12000,
      tickPeriod: 2000,
    },
    [SPELLS.WILD_GROWTH.id]: {
      duration: 7000,
      tickPeriod: 1000,
    },
    [SPELLS.LIFEBLOOM_HOT_HEAL.id]: {
      duration: 15000,
      tickPeriod: 1000,
    },
    [SPELLS.CENARION_WARD.id]: {
      duration: 8000,
      tickPeriod: 2000,
    },
    [SPELLS.CULTIVATION.id]: {
      duration: 6000,
      tickPeriod: 2000,
    },
    [SPELLS.SPRING_BLOSSOMS.id]: {
      duration: 6000,
      tickPeriod: 2000,
    },
    [SPELLS.DREAMER.id]: {
      duration: 8000,
      tickPeriod: 2000,
    },
  };

  powerOfTheArchdruid = {
    rejuvenation: { healing: 0 },
    regrowth: { healing: 0 },
  };
  tearstoneOfElune = { healing: 0 };
  t194p = { healing: 0 };
  t214p = { healing: 0 }; // used to distinguish Dreamer procs that would not have happened but for the 4pc

  // {
  //   [playerId]: {
  //      [hotId]: { applied, attributions },
  //   },
  // }
  hots = {};

  // PotA tracking stuff
  lastPotaRejuvTimestamp;
  lastPotalRegrowthTimestamp;
  potaTarget;

  // Tearstone tracking stuff
  lastWildgrowthTimestamp;
  hasTearstone;

  on_initialized() {
    this.hasTearstone = this.combatants.selected.hasFinger(ITEMS.TEARSTONE_OF_ELUNE.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.spellId;
    const targetId = event.targetID;

    // check for PotA proc
    const hadPota = this.combatants.selected.hasBuff(SPELLS.POWER_OF_THE_ARCHDRUID_BUFF, null, BUFFER_MS);
    if (spellId === SPELLS.REJUVENATION.id && hadPota) {
      this.lastPotaRejuvTimestamp = event.timestamp;
      this.potaTarget = targetId;
    } else if (spellId === SPELLS.REGROWTH.id && hadPota) {
      this.lastPotalRegrowthTimestamp = event.timestamp;
      this.potaTarget = targetId;
    } else if (spellId === SPELLS.WILD_GROWTH.id) {
      this.lastWildgrowthTimestamp = event.timestamp;
    }

    // TODO t194p
  }

  on_byPlayer_heal(event) {
    const spellId = event.spellId;
    if(!event.tick || spellId in this.hotInfo) {
      return;
    }

    const targetId = event.targetId;
    if (!targetId) {
      debug && console.log(`${event.ability.name} healed target without ID @${this.owner.formatTimestamp(event.timestamp)}... no attribution possible.`);
      return;
    }

    const hot = this.hots[targetId][spellId];
    if (!hot) {
      console.warn(`${event.ability.name} healed target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but that player isn't recorded as having that HoT...`);
    }

    const healing = event.amount + (event.absorbed || 0);
    hot.ticks.push({ healing, timestamp: event.timestamp });

    hot.attributions.forEach(att => att.healing += healing); // TODO add mastery benefit
    hot.boosts.forEach(att => att.healing += calculateEffectiveHealing(event, att.boost));
  }

  on_byPlayer_applybuff(event) {
    this._applyBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    this._refreshBuff(event);
  }

  on_byPlayer_removebuff(event) {
    this._removeBuff(event);
  }

  _applyBuff(event) {
    const spellId = event.ability.guid;
    if (!spellId in this.hotInfo) {
      return;
    }
    const targetId = event.targetID;
    if (!targetId) {
      debug && console.log(`${event.ability.name} applied to target without ID @${this.owner.formatTimestamp(event.timestamp)}... HoT will not be tracked.`);
      return;
    }
    if(!this.hots[targetId]) {
      this.hots[targetId] = {};
    }

    const newHot = {
      start: event.timestamp,
      end: event.timestamp + this.hotInfo[spellId].duration,
      ticks: [], // listing of ticks w/ effective heal amount and timestamp
      attributions: [], // new generated HoT
      extensions: [], // duration extensions to existing HoT
      boosts: [], // strength boost to existing HoT
      // TODO need more fields (like expected end)?
    };
    this.hots[targetId][spellId] = newHot;

    if(event.prepull) {
      return; // prepull HoTs can confuse things, we just assume they were hardcast
    }
    newHot.attributions.concat(this._getAttributions(spellId, targetId,  timestamp));
  }

  _refreshBuff(event) {
    const spellId = event.ability.guid;
    if (!spellId in this.hotInfo) {
      return;
    }
    const targetId = event.targetID;
    if (!targetId) {
      debug && console.log(`${event.ability.name} refreshed on target without ID @${this.owner.formatTimestamp(event.timestamp)}...`);
      return;
    }
    if(!this.hots[targetId] || !this.hots[targetId][spellId]) {
      console.warn(`${event.ability.name} refreshed on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but there's no record of the HoT being added...`);
    }

    const hot = this.hots[targetId][spellId];
    const oldEnd = hot.end;
    // TODO do something about early refreshes or whatever
    const newEndMax = oldEnd + this.hotInfo[spellId].duration;
    const pandemicMax = event.timestamp + this.hotInfo[spellId].duration * 1.3;
    hot.end = Math.min(newEndMax, pandemicMax);

    hot.attributions = this._getAttributions(spellId, targetId,  timestamp); // new attributions on refresh
    // TODO do something smart with extensions
    hot.boosts = [];
  }

  _removeBuff(event) {
    const spellId = event.ability.guid;
    if (!spellId in this.hotInfo) {
      return;
    }
    const targetId = event.targetID;
    if (!targetId) {
      debug && console.log(`${event.ability.name} removed from target without ID @${this.owner.formatTimestamp(event.timestamp)}...`);
      return;
    }
    if(!this.hots[targetId] || !this.hots[targetId][spellId]) {
      console.warn(`${event.ability.name} fell from target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but there's no record of the HoT being added...`);
    }

    // TODO assign HoT extension contribution now
    // TODO check how well actual fall time matched expcted fall time
    this.hots[targetId][spellId] = null;
  }

  _getAttributions(spellId, targetId, timestamp) {
    const attributions = [];
    if (spellId === SPELLS.REJUVENATION.id || SPELLS.REJUVENATION_GERMINATION.id) {
      if (this.lastPotaRejuvTimestamp + BUFFER_MS > timestamp && this.potaTarget !== targetId) { // PotA proc but not primary target
        attributions.push(this.powerOfTheArchdruid.rejuvenation);
      } else if (this.hasTearstone && this.lastWildgrowthTimestamp + BUFFER_MS > timestamp) {
        attributions.push(this.tearstoneOfElune);
      }

    } else if (spellId === SPELLS.REGROWTH.id) {
      if(this.lastPotalRegrowthTimestamp + BUFFER_MS > timestamp && this.potaTarget !== targetId) { // PotA proc but not primary target
        attributions.push(this.powerOfTheArchdruid.regrowth);
      }

    } else {
      // ...
    }
  }


}

export default Rejuvenation;
