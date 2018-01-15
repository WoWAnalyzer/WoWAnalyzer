import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Mastery from '../Mastery';

const PANDEMIC_FACTOR = 1.3;

const REJUV_IDS = [
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
];

const debug = false;

/*
 * Backend module for tracking attribution of HoTs, e.g. what applied them / applied parts of them / boosted them
 */
class HotTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    mastery: Mastery,
  };

  // {
  //   [playerId]: {
  //      [hotId]: { start, end, ticks, attributions, extensions, boosts },
  //   },
  // }
  hots = {};

  on_initialized() {
    this.hotInfo = this._generateHotInfo(); // some HoT info depends on traits and so must be generated dynamically
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    const healing = event.amount + (event.absorbed || 0);

    // handle mastery attribution
    if (this.hots[targetId]) {
      const oneStack = this.mastery.decomposeHeal(event).oneStack; // TODO move this before target validation so still counts direct healing
      Object.values(this.hots[targetId]).forEach(otherHot => {
        if (otherHot.spellId !== spellId) {
          otherHot.attributions.forEach(att => att.masteryHealing += oneStack);
          // boosts don't get mastery benefit because the hot was there with or without the boost
          // TODO add handling for HoT extensions
        }
      });
    }

    // handle Dreamwalker attribution (can be attributed to rejuvenation that procced it)
    if (spellId === SPELLS.DREAMWALKER.id) {
      if (!this.hots[targetId]) {
        console.warn(`${event.ability.name} ${event.type} on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but there is no Rejuvenation on that target???`);
        return;
      }
      const rejuvsOnTarget = Object.values(this.hots[targetId]).filter(otherHot => REJUV_IDS.includes(otherHot.spellId));
      if (rejuvsOnTarget.length === 0) {
        console.warn(`${event.ability.name} ${event.type} on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but there is no Rejuvenation on that target???`);
      } else if (rejuvsOnTarget.length === 1) { // for now only attribute if one rejuv on target .... TODO more complex logic for handling rejuv + germ
        rejuvsOnTarget[0].attributions.forEach(att => att.dreamwalkerHealing += healing);
        // boosts don't get mastery benefit because the hot was there with or without the boost
        // TODO add handling for HoT extensions
      }
    }

    if(!this._validateHot(event)) {
      return;
    }
    const hot = this.hots[targetId][spellId];
    if (event.tick) { // direct healing (say from a PotA procced regrowth) still should be counted for attribution, but not part of tick tracking
      hot.ticks.push({ healing, timestamp: event.timestamp });
    }

    hot.attributions.forEach(att => att.healing += healing);
    hot.boosts.forEach(att => att.healing += calculateEffectiveHealing(event, att.boost));
    // TODO add handling for HoT extensions
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    if (!this._validateHot(event)) {
      return;
    }

    const newHot = {
      start: event.timestamp,
      end: event.timestamp + this.hotInfo[spellId].duration,
      spellId, // stored extra here so I don't have to convert string to number like I would if I used its key in the object.
      ticks: [], // listing of ticks w/ effective heal amount and timestamp, to be used as part of the HoT extension calculations
      attributions: [], // The effect or bonus that procced this HoT application. No attribution implies the spell was hardcast.
      extensions: [], // The effects or bonuses that caused this HoT to have extended duration. TODO NYI
      boosts: [], // The effects or bonuses that caused the strength of this HoT to be boosted for its full duration.
    };
    if(!this.hots[targetId]) {
      this.hots[targetId] = {};
    }
    this.hots[targetId][spellId] = newHot;
  }

  on_byPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    if (!this._validateHot(event)) {
      return;
    }

    const hot = this.hots[targetId][spellId];
    const oldEnd = hot.end;

    // TODO check and build suggestions for early refreshes, etc

    const newEndMax = oldEnd + this.hotInfo[spellId].duration;
    const pandemicMax = event.timestamp + (this.hotInfo[spellId].duration * PANDEMIC_FACTOR);
    hot.end = Math.min(newEndMax, pandemicMax);

    hot.attributions = []; // new attributions on refresh
    // TODO add handling for HoT extensions... how should extensions be handled in the case of an early refresh?
    hot.boosts = [];
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    if (!this._validateHot(event)) {
      return;
    }

    // TODO here's where HoT extensions will actually be tallied
    // TODO check how well actual HoT remove time matched with the expected HoT remove time

    delete this.hots[targetId][spellId];
  }

  // to be called by external module, adds an attribution to the HoT with the given target / spellId
  // attribution object must have fields for name, healing, masteryHealing (and rejuv only: dreamwalkerHealing)
  addAttribution(attribution, targetId, spellId) {
    if (!this.hots[targetId] || !this.hots[targetId][spellId]) {
      console.warn(`Tried to add attribution ${attribution.name} to targetId=${targetId}, spellId=${spellId}, but that HoT isn't recorded as present`);
      return;
    }
    attribution.procs += 1;
    this.hots[targetId][spellId].attributions.push(attribution);
  }

  // to be called by external module, adds an extension to the HoT with the given target / spellId
  // attribution object must have fields for name, healing, masteryHealing (and rejuv only: dreamwalkerHealing)
  // amount is the number of ms to extend the HoT, and iff tickClamps is true the extension may be clamped depending on a formula TODO better description of this
  addExtensions(attribution, amount, tickClamps, targetId, spellId) {
    if (!this.hots[targetId] || !this.hots[targetId][spellId]) {
      console.warn(`Tried to add extension ${attribution.name} to targetId=${targetId}, spellId=${spellId}, but that HoT isn't recorded as present`);
      return;
    }

    let finalAmount = amount;
    if (tickClamps) {
      // TODO do clamping formula
    }

    attribution.procs += 1;
    this.hots[targetId][spellId].extensions.push({
      attribution,
      amount: finalAmount,
    });
  }

  // gets an event's target ... returns null if for any reason the event should not be further processed
  _getTarget(event) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return null; // target wasn't important (a pet probably)
    }

    const targetId = event.targetID;
    if (!targetId) {
      debug && console.log(`${event.ability.name} ${event.type} to target without ID @${this.owner.formatTimestamp(event.timestamp)}... HoT will not be tracked.`);
      return null;
    } else {
      debug && console.log(`${event.ability.name} ${event.type} to ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)}`);
    }

    return target;
  }

  // validates that event is for one of the tracked hots and that HoT tracking involving it is in the expected state
  _validateHot(event) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!(spellId in this.hotInfo)) {
      return false; // we only care about the listed HoTs
    }

    if (['removebuff', 'refreshbuff', 'heal'].includes(event.type) &&
       (!this.hots[targetId] || !this.hots[targetId][spellId])) {
      console.warn(`${event.ability.name} ${event.type} on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but there's no record of that HoT being added...`);
      return false;
    } else if ('applybuff' === event.type && this.hots[targetId] && this.hots[targetId][spellId]) {
      console.warn(`${event.ability.name} ${event.type} on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but that HoT is recorded as already added...`);
      return false;
    }

    return true;
  }

  _generateHotInfo() { // must be generated dynamically because it reads from traits
    return {
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
  }
}

export default HotTracker;
