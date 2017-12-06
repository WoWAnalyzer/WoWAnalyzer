import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

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
    hot.attributions.forEach(att => att.healing += healing);
    // TODO handle extensions
    hot.boosts.forEach(att => att.healing += calculateEffectiveHealing(event, att.boost));
  }

  on_byPlayer_applybuff(event) {
    this._applyBuff(event);
  }

  on_byPlayer_refreshbuff(event) {
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

    newHot.attributions.concat(this._getAttributions(spellId, timestamp));
    this.hots[targetId][spellId] = newHot;
  }

  _removeBuff(event) {
    // TODO implement
  }

  _getAttributions(spellId, timestamp) {
    if (spellId === SPELLS.REJUVENATION.id || SPELLS.REJUVENATION_GERMINATION.id) {


    } else {
      // ...
    }
  }


}

export default Rejuvenation;
