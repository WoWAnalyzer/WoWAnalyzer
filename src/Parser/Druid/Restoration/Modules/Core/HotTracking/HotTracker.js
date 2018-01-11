import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Mastery from '../Mastery';

const PANDEMIC_FACTOR = 1.3;

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
  //      [hotId]: { applied, attributions, ... },
  //   },
  // }
  hots = {};

  on_initialized() {
    this.hotInfo = this._generateHotInfo(); // some HoT info depends on traits and so must be generated dynamically
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    // TODO attribute Dreamwalker...

    const target = this._validateAndGetTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    const hot = this.hots[targetId][spellId];

    const healing = event.amount + (event.absorbed || 0);
    if (event.tick) { // direct healing (say from a PotA procced regrowth) still should be counted for attribution, but not part of tick tracking
      hot.ticks.push({ healing, timestamp: event.timestamp });
    }

    hot.attributions.forEach(att => att.healing += healing);
    hot.boosts.forEach(att => att.healing += calculateEffectiveHealing(event, att.boost));

    // TODO add handling for HoT extensions

    // attribute mastery boosting as well to all the other HoTs on the heal's target
    const oneStack = this.mastery.decomposeHeal(event).oneStack; // TODO move this before target validation so still counts direct healing
    Object.keys(this.hots[targetId]).forEach(otherSpellId => {
      if (otherSpellId !== spellId) {
        const otherHot = this.hots[targetId][otherSpellId];
        otherHot.attributions.forEach(att => att.masteryHealing += oneStack);
        // boosts don't get mastery benefit because the hot was there with or without the boost
        // TODO add handling for HoT extensions
      }
    });
  }

  on_byPlayer_applybuff(event) {
    // if (event.ability.guid === SPELLS.AWAKENED.id) {
    //   // 4t21 proc causes 5 dreamer procs that would not otherwise have happened
    //   // while in reality there is usually a quick sequence of 6 dreamers, one of which is "natural",
    //   // we simplify by attributing the next 5 to 4t21
    //   this.remaining4t21attributes = 5;
    // }

    const spellId = event.ability.guid;
    const target = this._validateAndGetTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;

    const newHot = {
      start: event.timestamp,
      end: event.timestamp + this.hotInfo[spellId].duration,
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
    const target = this._validateAndGetTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;

    const hot = this.hots[targetId][spellId];
    const oldEnd = hot.end;

    // TODO check / build suggestion for early refreshes, etc

    const newEndMax = oldEnd + this.hotInfo[spellId].duration;
    const pandemicMax = event.timestamp + (this.hotInfo[spellId].duration * PANDEMIC_FACTOR);
    hot.end = Math.min(newEndMax, pandemicMax);

    hot.attributions = []; // new attributions on refresh
    // TODO add handling for HoT extensions... how should extensions be handled in the case of an early refresh?
    hot.boosts = [];
  }

  on_byPlayer_removebuff(event) {
    if(event.ability.guid === SPELLS.POWER_OF_THE_ARCHDRUID_BUFF.id) {
      this.potaFallTimestamp = event.timestamp; // FIXME temp until figure out hasBuff problem
    }

    const spellId = event.ability.guid;
    const target = this._validateAndGetTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;

    // TODO here's where HoT extensions will actually be tallied
    // TODO check how well actual HoT remove time matched with the expected HoT remove time

    delete this.hots[targetId][spellId];
  }

  // validates an event and gets its target ... returns null if for any reason the event should not be further processed
  _validateAndGetTarget(event) {
    const spellId = event.ability.guid;
    if (!(spellId in this.hotInfo)) {
      return null; // we only care about the listed HoTs
    }

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

    if (['removebuff', 'refreshbuff', 'heal'].includes(event.type) &&
       (!this.hots[targetId] || !this.hots[targetId][spellId])) {
      console.warn(`${event.ability.name} ${event.type} on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp)} but there's no record of the HoT being added...`);
      return null;
    }

    return target;
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
