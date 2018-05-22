import SPELLS from 'common/SPELLS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Haste from 'Parser/Core/Modules/Haste';
import calculateEffectiveHealing from 'Parser/Core/calculateEffectiveHealing';
import Mastery from '../Mastery';

const PANDEMIC_FACTOR = 1.3;
const PANDEMIC_EXTRA = 0.3;

const REJUV_IDS = [
  SPELLS.REJUVENATION.id,
  SPELLS.REJUVENATION_GERMINATION.id,
];

// tolerated difference between expected and actual HoT fall before a 'mismatch' is logged
const EXPECTED_REMOVAL_THRESHOLD = 100;

// this class does a lot, a few different debug areas to cut down on the spam while debugging
const debug = false;
const extensionDebug = false; // logs pertaining to extensions
const applyRemoveDebug = false; // logs tracking HoT apply / refresh / remove
const healDebug = false; // logs tracking HoT heals

/**
 * Backend module for tracking attribution of HoTs, e.g. what applied them / applied parts of them / boosted them
 */
class HotTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    mastery: Mastery,
    haste: Haste,
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

    // handle Mastery attribution
    if (this.hots[targetId]) {
      const oneStack = this.mastery.decomposeHeal(event).oneStack;
      Object.values(this.hots[targetId]).forEach(otherHot => {
        if (otherHot.spellId !== spellId) {
          otherHot.attributions.forEach(att => {
            att.masteryHealing += oneStack;
          });

          // boosts don't get mastery benefit because the hot was there with or without the boost

          // to avoid making a crazy number of array elements but still be able to include mastery info for extensions,
          // mastery healing stored with the tick that immediately preceded it, can be read from there while calc extension benefit
          const numTicks = otherHot.ticks.length;
          if(numTicks > 0) {
            otherHot.ticks[numTicks-1].masteryHealing += oneStack;
          }
        }
      });
    }

    // handle Dreamwalker attribution (can be attributed to rejuvenation that procced it)
    if (spellId === SPELLS.DREAMWALKER.id) {
      if (!this.hots[targetId]) {
        console.warn(`${event.ability.name} ${event.type} on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp, 1)} but there is no Rejuvenation on that target???`);
        return;
      }
      const rejuvsOnTarget = Object.values(this.hots[targetId]).filter(otherHot => REJUV_IDS.includes(otherHot.spellId));
      if (rejuvsOnTarget.length === 0) {
        console.warn(`${event.ability.name} ${event.type} on target ID ${targetId} @${this.owner.formatTimestamp(event.timestamp, 1)} but there is no Rejuvenation on that target???`);
      } else if (rejuvsOnTarget.length === 1) { // for now only attribute if one rejuv on target .... TODO more complex logic for handling rejuv + germ
        const rejuv = rejuvsOnTarget[0];
        rejuv.attributions.forEach(att => {
          att.dreamwalkerHealing += healing;
        });

        // boosts don't get dreamwalker benefit because the hot was there with or without the boost

        // to avoid making a crazy number of array elements but still be able to include dreamwalker info for extensions,
        // dreamwalker healing stored with the tick that immediately preceded it, can be read from there while calc extension benefit
        const numTicks = rejuv.ticks.length;
        if(numTicks > 0) {
          const mostRecentTick = rejuv.ticks[numTicks-1];
          if (!mostRecentTick.dreamwalkerHealing) {
            mostRecentTick.dreamwalkerHealing = 0;
          }
          mostRecentTick.dreamwalkerHealing += healing;
        }
      }
    }

    if(!this._validateHot(event)) {
      return;
    }
    const hot = this.hots[targetId][spellId];
    if (event.tick) { // direct healing (say from a PotA procced regrowth) still should be counted for attribution, but not part of tick tracking
      // mastery healing populated with all healing due to mastery after this tick but before the next... done this way to avoid array size getting out of control
      hot.ticks.push({ healing, masteryHealing: 0, timestamp: event.timestamp });
    }

    hot.attributions.forEach(att => {
      att.healing += healing;
    });
    hot.boosts.forEach(att => {
      att.healing += calculateEffectiveHealing(event, att.boost);
    });
    // extensions handled when HoT falls, using ticks list
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
      name: event.ability.name, // stored for logging
      ticks: [], // listing of ticks w/ effective heal amount and timestamp, to be used as part of the HoT extension calculations
      attributions: [], // The effect or bonus that procced this HoT application. No attribution implies the spell was hardcast.
      extensions: [], // The effects or bonuses that caused this HoT to have extended duration. Format: { amount, attribution }
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
    const freshDuration = this.hotInfo[spellId].duration;
    hot.end += this._calculateExtension(freshDuration, hot, spellId, true, true);

    // seperately calculating if refresh was in pandemic, because for display to the player I want to avoid factoring in tick clipping...
    const remaining = oldEnd - event.timestamp;
    const clipped = remaining - (freshDuration * PANDEMIC_EXTRA);
    if (clipped > 0) {
      debug && console.log(`${event.ability.name} on target ID ${targetId} was refreshed early @${this.owner.formatTimestamp(event.timestamp)}, clipping ${(clipped/1000).toFixed(1)}s`);
      hot.extensions.forEach(ext => {
        ext.amount -= clipped;
        extensionDebug && console.log(`Extension ${ext.attribution.name} on ${event.ability.name} / ${targetId} @${this.owner.formatTimestamp(event.timestamp)} was clipped by ${(clipped/1000).toFixed(1)}s`);
      });
      // TODO do more stuff about clipped HoT duration (a suggestion?). Only suggest for clipping hardcasts, of course.
    }

    hot.attributions = []; // new attributions on refresh

    this._tallyExtensions(hot);
    hot.extensions = [];

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

    this._checkRemovalTime(this.hots[targetId][spellId], event.timestamp, targetId);
    this._tallyExtensions(this.hots[targetId][spellId]);

    delete this.hots[targetId][spellId];
  }

  /*
   * Adds an attribution to the HoT with the given spellId on the given targetId.
   * Attribution object passed in will be modified as the HoT heals, and must have the following fields:
   *    name: String (used only for logging)
   *    healing: Number (tallies the direct healing attributable)
   *    masteryHealing: Number (tallies the mastery healing attributable)
   *    (for Rejuv/Germ only) dreamwalkerHealing: Number (tallies the dreamwalker healing attributable)
   *    procs: Number (tallies the number of times this attribution was made)
   */
  addAttribution(attribution, targetId, spellId) {
    if (!this.hots[targetId] || !this.hots[targetId][spellId]) {
      console.warn(`Tried to add attribution ${attribution.name} to targetId=${targetId}, spellId=${spellId}, but that HoT isn't recorded as present`);
      return;
    }
    attribution.procs += 1;
    this.hots[targetId][spellId].attributions.push(attribution);
    debug && console.log(`${this.hots[targetId][spellId].name} on ${targetId} @${this.owner.formatTimestamp(this.owner.currentTimestamp, 1)} attributed to ${attribution.name}`);
  }

  /*
   * Extends the duration of the HoT with the the given spellId on the given targetId, and adds an attribution to that extension.
   * Attribution object passed in will be modified when the HoT expires, and must have the following fields:
   *    name: String (used only for logging)
   *    healing: Number (tallies the direct healing attributable)
   *    masteryHealing: Number (tallies the mastery healing attributable)
   *    (for Rejuv/Germ only) dreamwalkerHealing: Number (tallies the dreamwalker healing attributable)
   *    procs: Number (tallies the number of times this attribution was made)
   *    duration: Number (tallies the actual amount of extension applied, after clamping)
   * tickClamps and pandemicClamps specify if / how the extension should be clamped
   *
   * NOTE: can pass a null attribution to extend HoT without attributing it
   */
  addExtension(attribution, amount, targetId, spellId, tickClamps = true, pandemicClamps = false) {
    if (!this.hots[targetId] || !this.hots[targetId][spellId]) {
      console.warn(`Tried to add extension ${attribution.name || 'NO-ATT'} to targetId=${targetId}, spellId=${spellId}, but that HoT isn't recorded as present`);
      return;
    }

    const hot = this.hots[targetId][spellId];

    const finalAmount = this._calculateExtension(amount, hot, spellId, tickClamps, pandemicClamps);
    hot.end += finalAmount;

    // TODO log the result
    if (!attribution) {
      return;
    }

    attribution.procs += 1;
    const existingExtension = hot.extensions.find(extension => extension.attribution.name === attribution.name);
    if (existingExtension) {
      existingExtension.amount += finalAmount;
    } else {
      hot.extensions.push({
        attribution,
        amount: finalAmount,
      });
    }
    debug && console.log(`${hot.name} on ${targetId} @${this.owner.formatTimestamp(this.owner.currentTimestamp, 1)} extended ${(finalAmount/1000).toFixed(1)}s by ${attribution.name}`);
  }

  /*
   * For each attributed extension on a HoT, tallies the granted healing
   */
  _tallyExtensions(hot) {
    hot.extensions
        .filter(ext => ext.amount > 0) // early refreshes can wipe out the effect of an extension, filter those ones out
        .forEach(ext => this._tallyExtension(hot.ticks, ext.amount, ext.attribution));
  }

  _tallyExtension(ticks, amount, attribution) {
    const now = this.owner.currentTimestamp;

    let foundEarlier = false;
    let latestOutside = now;
    let healing = 0;
    let masteryHealing = 0;
    let dreamwalkerHealing = 0;
    // sums healing of every tick within 'amount',
    // also gets the latest tick outside the range, used to scale the healing amount
    for (let i = ticks.length-1; i >= 0; i--) {
      const tick = ticks[i];
      latestOutside = tick.timestamp;
      if ((now - tick.timestamp) > amount) {
        foundEarlier = true;
        break;
      }

      healing += tick.healing;
      masteryHealing += tick.masteryHealing;
      if (tick.dreamwalkerHealing !== undefined) {
        dreamwalkerHealing += tick.dreamwalkerHealing;
      }
    }

    if (foundEarlier) {
      // TODO better explanation of why I need to scale direct healing
      const scale = amount / (now - latestOutside);
      attribution.healing += (healing * scale);
      // mastery and dreamwalker heals are either inside the extension range or they aren't, as such they shouldn't be scaled
      attribution.masteryHealing += masteryHealing;
      if (attribution.dreamwalkerHealing !== undefined) {
        attribution.dreamwalkerHealing += dreamwalkerHealing;
      }
      attribution.duration += amount;
    } else {
      // TODO error log, because this means the extension was almost all the HoT's duration? Check for an early removal of HoT.
    }
  }

  /*
   * HoT extensions (for whatever reason) do not always extend by exactly the listed amount.
   * Instead, they follow the following formula, which this function implements:
   *
   * Add the raw extension amount to the current time remaining on the HoT, then round to the nearest whole number of ticks (with respect to haste)
   * Note that as most tick periods scale with haste, this rounding effectively works on a snapshot of the player's haste at the moment of the extension.
   *
   * An example:
   * The player casts Flourish (raw extension = 6 seconds), extending a Rejuvenation with 5.4s remaining.
   * The player's current haste is 20%, meaning rejuv's current tick period = 3 / (1 + 0.2) = 2.5
   * Time remaining after raw extension = 5.4 + 6 = 11.6
   * Ticks remaining after extension, before rounding = 11.6 / 2.5 = 4.64
   * Round(4.64) = 5 ticks => 5 * 2.5 = 12.5 seconds remaining after extension and rounding
   * Effective extension amount = 12.6 - 5.4 = 7.2
   * Note that this can round up or down
   *
   * Thanks @tremaho for the detailed explanation of the formula
   */
  _calculateExtension(rawAmount, hot, spellId, tickClamps, pandemicClamps) {
    let amount = rawAmount;
    const currentTimeRemaining = hot.end - this.owner.currentTimestamp;

    let pandemicLog = '';
    if (pandemicClamps) {
      const newTimeRemaining = currentTimeRemaining + amount;
      const pandemicMax = this.hotInfo[spellId].duration * PANDEMIC_FACTOR;
      if (newTimeRemaining > pandemicMax) {
        amount = pandemicMax - currentTimeRemaining;
        pandemicLog = `PANDEMIC:(remaining=${(pandemicMax/1000).toFixed(2)}s)`;
      } else {
        pandemicLog = `PANDEMIC:(N/A)`;
      }
    }

    let tickLog = '';
    if (tickClamps) {
      const currentTickPeriod = this.hotInfo[spellId].tickPeriod / (1 + this.haste.current);
      const newTimeRemaining = currentTimeRemaining + amount;
      const newTicksRemaining = newTimeRemaining / currentTickPeriod;
      const newRoundedTimeRemaining = Math.round(newTicksRemaining) * currentTickPeriod;
      amount = newRoundedTimeRemaining - currentTimeRemaining;
      tickLog = `TICK:(period=${(currentTickPeriod/1000).toFixed(2)}s)`;
    }

    // an extension can never reduce HoT's remaining duration, even after clamping
    amount = Math.max(0, amount);

    extensionDebug && console.log(`${hot.name} w/ ${(currentTimeRemaining/1000).toFixed(2)}s remaining gets ${(rawAmount/1000).toFixed(2)}s extension clamped by ${pandemicLog} ${tickLog} => actual: ${(amount/1000).toFixed(2)}s, new remaining: ${((amount+currentTimeRemaining)/1000).toFixed(2)}s`);

    return amount;
  }

  // Returns the difference between the timestamp and the expected removal time listed in the hot object.
  // Return will be positive if HoT actually ended after expected end (eg HoT lasted longer than expected).
  // Return will be negative if HoT actually ended before expected end (eg HoT lasted shorter than expected).
  // Logs when difference is over a certain threshold.
  _checkRemovalTime(hot, actual, targetId) {
    const expected = hot.end;
    const diff = actual - expected;
    if (diff > EXPECTED_REMOVAL_THRESHOLD) {
      // The only reason HoT could last longer than expected is we are missing an extension, which is a bug -> log a warning
      extensionDebug && console.warn(`${hot.name} on ${targetId} fell @${this.owner.formatTimestamp(actual, 1)}, which is ${(diff/1000).toFixed(1)}s LATER than expected... Missing an extension?`);
    } else if (diff < (-1 * EXPECTED_REMOVAL_THRESHOLD)) {
      // Several legitimate reasons HoT could last shorter than expected: lifebloom swap, target dies, target was purged, target cancelled the spell -> log only when debug on
      extensionDebug && console.warn(`${hot.name} on ${targetId} fell @${this.owner.formatTimestamp(actual, 1)}, which is ${-(diff/1000).toFixed(1)}s earlier than expected`);
    }
    return diff;
  }

  // gets an event's target ... returns null if for any reason the event should not be further processed
  _getTarget(event) {
    const target = this.combatants.getEntity(event);
    if (!target) {
      return null; // target wasn't important (a pet probably)
    }

    const targetId = event.targetID;
    if (!targetId) {
      debug && console.log(`${event.ability.name} ${event.type} to target without ID @${this.owner.formatTimestamp(event.timestamp, 1)}... HoT will not be tracked.`);
      return null;
    } else {
      if (event.type === 'heal') {
        healDebug && console.log(`${event.ability.name} ${event.type} to ID ${targetId} @${this.owner.formatTimestamp(event.timestamp, 1)}`);
      } else {
        applyRemoveDebug && console.log(`${event.ability.name} ${event.type} to ID ${targetId} @${this.owner.formatTimestamp(event.timestamp, 1)}`);
      }
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
