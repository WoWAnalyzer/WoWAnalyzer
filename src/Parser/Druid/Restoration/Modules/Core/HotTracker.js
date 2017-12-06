import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

const BUFFER_MS = 100;

const DRUID_HOTS = [
  SPELLS.REJUVENATION.id,
  SPELLS.WILD_GROWTH.id,
  SPELLS.REJUVENATION_GERMINATION.id,
  SPELLS.CULTIVATION.id,
  SPELLS.CENARION_WARD.id,
  SPELLS.LIFEBLOOM_HOT_HEAL.id,
  // Make sure to check that event.tick is true, because regrowth uses the same id for the heal and the HoT part
  SPELLS.REGROWTH.id,
  SPELLS.SPRING_BLOSSOMS.id,
  SPELLS.DREAMER.id,
];

const debug = false;

/*
 * Backend module for tracking attribution of HoTs, e.g. what applied them / applied parts of them / boosted them
 */
class Rejuvenation extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  potaRejuv = { healing: 0 };
  potaRegrowth = { healing: 0 };
  tearstone = { healing: 0 };
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
    if(!event.tick || DRUID_HOTS.includes(spellId)) {
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
    hot.attributions.forEach(att => att.healing += healing); // TODO add mastery benefit
    // TODO handle extensions
    hot.boosts.forEach(att => att.healing += calculateEffectiveHealing(event, att.boost));
  }

  on_byPlayer_applybuff(event) {
    this._applyBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
    // TODO check for hardcast early refresh?
    this._removeBuff(event);
    this._applyBuff(event);
  }

  on_byPlayer_removebuff(event) {
    this._removeBuff(event);
  }

  _applyBuff(event) {
    const spellId = event.ability.guid;
    if (!DRUID_HOTS.includes(spellId)) {
      return;
    }

    const targetId = event.targetID;
    if (!targetId) {
      debug && console.log(`${event.ability.name} cast on target without ID @${this.owner.formatTimestamp(event.timestamp)}... HoT will not be tracked.`);
      return;
    }

    if(!this.hots[targetId]) {
      this.hots[targetId] = {};
    }

    const newHot = {
      start: event.timestamp,
      attributions: [], // new generated HoT
      extensions: [], // duration extensions to existing HoT
      boosts: [], // strength boost to existing HoT
      // TODO need more fields (like expected end)?
    };

    newHot.attributions.concat(this._getAttributions(spellId, targetId,  timestamp));
    this.hots[targetId][spellId] = newHot;
  }

  _removeBuff(event) {
    const spellId = event.ability.guid;
    if (!DRUID_HOTS.includes(spellId)) {
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

    // TODO attribution cleanup of some sort, like checking for an early refresh or ????
    this.hots[targetId][spellId] = null;
  }

  _getAttributions(spellId, targetId, timestamp) {
    const attributions = [];
    if (spellId === SPELLS.REJUVENATION.id || SPELLS.REJUVENATION_GERMINATION.id) {
      if (this.lastPotaRejuvTimestamp + BUFFER_MS > timestamp && this.potaTarget !== targetId) { // PotA proc but not primary target
        attributions.push(this.potaRejuv);
      } else if (this.hasTearstone && this.lastWildgrowthTimestamp + BUFFER_MS > timestamp) {
        attributions.push(this.tearstone);
      }

    } else if (spellId === SPELLS.REGROWTH.id) {
      if(this.lastPotalRegrowthTimestamp + BUFFER_MS > timestamp && this.potaTarget !== targetId) { // PotA proc but not primary target
        attributions.push(this.potaRegrowth);
      }

    } else {
      // ...
    }
  }


}

export default Rejuvenation;
