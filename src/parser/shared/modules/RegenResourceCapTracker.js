import Analyzer from 'parser/core/Analyzer';
import Haste from 'parser/shared/modules/Haste';
import HIT_TYPES from 'game/HIT_TYPES';
import SpellResourceCost from 'parser/shared/modules/SpellResourceCost';

// turn on debug to find if there's inaccuracies, then verboseDebug to help track the cause.
const debug = false;
const verboseDebug = false;

/*
 * Tracks when a regenerating resource reaches its cap. Most useful for specs such as rogues
 * and feral druids where their energy resource quickly recharges through natural regeneration
 * and may frequently reach its cap during a fight.
 * 
 * It is an 'abstract' class, so should be extended and provided with settings for the resource
 * being tracked by your spec. Search for "IMPLEMENTME" for what should be set up.
 * 
 * Reductions in spell costs should be handled by implementing parser/core/Modules/SpellResourceCost
 * for the relevant resource.
 * 
 * If your derived class shares event handlers remember to call the original, e.g.
 * on_byPlayer_cast(event) {
 *  super.on_byPlayer_cast(event);
 *  // stuff related to your spec's implementation
 * }
 * 
 * Example derived class: parser/Druid/Feral/Modules/Features/EnergyCapTracker
 * 
 * For a more complete picture of how a combatant is using their resources you may want to
 * also use parser/core/Modules/ResourceTracker
 * ResourceTracker handles how it's energized and spent, RegenResourceCapTracker will tell
 * you about natural regeneration and how long it's at cap.
 * 
 * The accuracy of this module's predictions depends heavily on finding the "quirks" of how
 * abilities and their resource behaviours appear in the combat log. It can never be perfectly
 * accurate due to resources being rounded to integer values and latency issues, but an error
 * of less than ±2 should be possible.
 * 
 * Fabricates events 'beginresourcecap' and 'endresourcecap'. See the functions fabricateBeginCap
 * and fabricateEndCap for details on these events and their limitations.
 */

/**
 * How far (in ms) damage event can be separated from a cast and still use its information
 * to decide there should be a resource refund due to not hiting. 208ms is highest I've seen.
 */
 const REFUND_SPENDER_WINDOW = 500;
 const HIT_TYPES_THAT_REFUND = [
  HIT_TYPES.MISS,
  HIT_TYPES.DODGE,
  HIT_TYPES.PARRY,
];
 
 class RegenResourceCapTracker extends Analyzer {
  static dependencies = {
    haste: Haste,
    // Needed for the `resourceCost` prop of events
    spellResourceCost: SpellResourceCost,
  };

  // -- Start of IMPLEMENTME statics

  // One of game/RESOURCE_TYPES
  static resourceType;
  
  // Resource's base regeneration rate in points per second (e.g. 10 for Energy)
  static baseRegenRate = 0;
  
  /**
   * Is natural regeneration rate increased by haste.
   * If a resource is affected by haste in an unusual way, set false and handle it manually in naturalRegenRate
   */
  static isRegenHasted = false;

  /**
   * Any buff or debuff IDs that change the max value for this resource. e.g. Berserk for Feral.
   * Remember to check for their presence and apply the effect in currentMaxResource
   */
  static buffsChangeMax = [];

  /**
   * Any buff or debuff IDs that directly affect natural regeneration rate for this resource. e.g. Adrenaline Rush for Outlaw.
   * Remember to check for their presence and apply the effect in naturalRegenRate
   */
  static buffsChangeRegen = [];

  // Events for some abilities give inaccurate "amount" values, so their change is best applied cumulatively.
  static energizersToApplyCumulatively = [];
  static castsToApplyCumulatively = [];
  static drainsToApplyCumulatively = [];

  /**
   * How close (in ms) a resource changing event must be to the last one to have the change handled cumulatively.
   * 
   * When resource changing events occur in a very short time the values in the combat log can become inaccurate. 
   *  What happens in the fight:
   * t: 1  player has 50 energy
   * t: 2  cast spending 20 energy
   * t: 2  energize gaining 30 energy
   * t: 3  player has 60 energy
   * 
   *  What the log shows:
   * cast {timestamp: 2, classResources[i]: {amount: 50, cost: 20}}
   * energize {timestamp: 2, resourceChange: 30, classResources[i]: {amount: 80}}
   * ('amount' for cast events is what it was before the event, for energize events it's after.)
   * 
   * If we trusted the resource information given by the last parsed event we'd expect energy to
   * be 80 at t = 3.
   */
  static cumulativeEventWindow = 100;

  /**
   * For some specs (e.g. energy for rogues and feral) a ability that doesn't hit refunds some of the resource.
   * A value of 0 means no refund, 0.8 seems to be the standard refund amount.
   */
  static resourceRefundOnMiss = 0;

  // Some abilities never get their resources refunded, usually AoEs. List their spellIds here.
  static exemptFromRefund = [];

  // -- end of IMPLEMENTME statics

  // Total time spent with resource at maximum (in ms)
  atCap = 0;

  // Total resources lost from natural regeneration (ONLY natural regeneration) due to being capped
  missedRegen = 0;

  // Total resources generated from natural regeneration, includes wasted resources.
  naturalRegen = 0;
  
  regenState = null;
  prevSpender = null;
  hasReportedBelowCap = false;
  
  /**
   * Amount of resource that should be available at current timestamp, accounting for natural regeneration.
   * @returns {number}
   */
  get current() {
    return this.predictValue(this.owner.currentTimestamp);
  }

  /**
   * Whether the resource is at its cap at the current timestamp.
   * @returns {boolean}
   */
  get isCapped() {
    return this.current >= this.regenState.max;
  }

  /**
   * What fraction of the fight was spent with this resource at its cap.
   * @returns {number}
   */
  get cappedProportion() {
    return this.atCap / this.owner.fightDuration;
  }

  /**
   * Resource lost from natural regeneration (only from natural regeneration, not energizers) due
   * to the resource reaching cap, averaged to a per-minute value.
   */
  get missedRegenPerMinute() {
    return (this.missedRegen / this.owner.fightDuration) * 1000 * 60;
  }

  constructor(...args) {
    super(...args);
    // can't know resource state for certain until the first combat events, but assume a regenerating resource starts full.
    const max = this.currentMaxResourceWithFallback();
    this.regenState = {
      amount: max ? max : 0,
      max,
      regen: this.naturalRegenRate(),
      timestamp: this.owner.fight.start_time,
    };
  }

  /**
   * IMPLEMENTME
   * Some specs have drain reductions that aren't already shown in events, which should be implemented
   * here. Drain events are separate from an ability cast cost.
   * @param   {object}  event A drain event being applied to the player.
   * @returns {number}  Drain amount after any reductions are applied.
   */
  getReducedDrain(event) {
    return event.resourceChange;
  }
  
  /**
   * IMPLEMENTME
   * Calculate current natural regeneration rate of the resource.
   * When checking combant's buffs/debuffs you may want to use this.combatantHasBuffActive() rather than
   * the .hasBuff of the combatant directly, doing so will exclude buffs which wore off at this timestamp.
   * @returns {number}  Resource expected to be generated per ms.
   */
  naturalRegenRate() {
    let regen = this.constructor.baseRegenRate / 1000;
    if (this.constructor.isRegenHasted) {
      regen *= (1 + this.haste.current);
    }
    return regen;
  }

  /**
   * IMPLEMENTME
   * Calculate current maximum value for the resource. Accounting for items, talents, and active buffs.
   * When checking combant's buffs/debuffs you may want to use this.combatantHasBuffActive() rather than
   * the .hasBuff of the combatant directly, doing so will exclude buffs which wore off at this timestamp.
   * @returns {number}  Maximum resource value, or null to try to use value from resource events.
   */
  currentMaxResource() {
   /**
    * If left unimplemented and no events provide max resource information the Analyzer will never know
    * the resource's max value. It handles that situation without crashing, but without a cap value it
    * is largely useless.
    */
    return null;
  }

  /**
   * Applies an energize of the tracked resource type at the current timestamp.
   * Use when a spec has a source of resource which doesn't appear as an energize event in the log.
   * If you have an invisible energize that happens over a duration you should generate an event for
   * each tick, as applying it all at once can lead to inaccuracies. If it doesn't have ticks consider
   * handling it as a buff to the natural regeneration rate instead.
   * @param {number} amount Raw amount of resources to gain. Limiting to max is done within this function
   * so there's no need to check before passing it in.
   */
  processInvisibleEnergize(amount) {
    if (amount == null || isNaN(amount)) {
      throw new Error(`processInvisibleEnergize called without required parameter. amount: ${amount}`);
    }
    if (amount === 0) {
      return;
    }
    const before = this.current;
    const after = Math.min(before + amount, this.currentMaxResourceWithFallback());
    const gain = after - before;
    this.applyEnergize(gain);
  }

  /**
   * Fetches the appropriate classResources object from an event, or null if there is none available.
   * @param {object} event An event object which may have an appropriate .classResources property.
   */
  getResource(event) {
    if (!event || !event.classResources) {
      return null;
    }
    return event.classResources.find(r => r.type === this.constructor.resourceType.id);
  }

  /**
   * Fetches the cost of a cast event. Using its resourceCost property (added by SpellResourceCost)
   * if it's available or the resource cost given by the combat log if not.
   * @param {object} event A cast event object with a resource cost associated with it.
   */
  getCost(event) {
    if (event.resourceCost[this.constructor.resourceType.id] !== undefined) {
      return event.resourceCost[this.constructor.resourceType.id];
    }
    return this.getResource(event).cost;
  }

  /**
   * A variation of this.selectedCombatant.hasBuff that excludes any buffs which were removed on the timestamp.
   * @param {number} buffId ID of buff or debuff to check for on the current combatant.
   * @param {number} timestamp Time to check, or null to use current timestamp. Cannot be a future timestamp.
   */
  combatantHasBuffActive(buffId, timestamp = null) {
    if (!buffId || isNaN(buffId)) {
      throw new Error(`combatantHasBuffActive called without required parameter. buffId: ${buffId}`);
    }
    if (!timestamp) {
      timestamp = this.owner.currentTimestamp;
    }
    const buffHistory = this.selectedCombatant.getBuffHistory(buffId);
    return !!buffHistory.find(buff => (buff.start <= timestamp && (!buff.end || buff.end > timestamp)));
  }

  on_finished() {
    // updateState one last time to catch any resource capping after the final resource event
    this.updateState(this.predictValue(this.owner.fight.end_time));
    debug && console.log(`mean prediction error magnitude: ${this.debugMeanPredictionError.toFixed(2)}`);
    debug && console.log(`greatest magnitude prediction error: ${this.debugGreatestError.toFixed(2)}`);
  }

  on_toPlayer_energize(event) {
    if(event.resourceChangeType !== this.constructor.resourceType.id || !event.resourceChange) {
      return;
    }
    const waste = event.waste ? event.waste : 0;
    const gain = event.resourceChange - waste;
    const applyCumulatively = this.constructor.energizersToApplyCumulatively.includes(event.ability.guid);
    this.applyEnergize(gain, event, applyCumulatively);
  }

  applyEnergize(gain, event = null, applyCumulatively = false) {
    if (gain == null || isNaN(gain)) {
      // using == null to catch undefined, but still allow 0
      throw new Error(`applyEnergize called without required parameter. gain: ${gain}`);
    }
    const time = event ? event.timestamp : this.owner.currentTimestamp;
    const eventResource = event ? this.getResource(event) : null;

    const shouldAccumulate = applyCumulatively ||
      this.isLastUpdateRecent(time) ||
      !eventResource || eventResource.amount == null;

    // eventResource.amount for an energize is the value after the change
    const current = shouldAccumulate ? (this.predictValue(time) + gain) : eventResource.amount;
    if (debug && !shouldAccumulate) {
      this.debugActualVsPredicted(eventResource.amount - gain, time);
    }
    const max = this.currentMaxResourceWithFallback(event);
    this.updateState(current, max);
  }

  on_byPlayer_cast(event) {
    const eventResource = this.getResource(event);
    if (!eventResource) {
      return;
    }
    const cost = this.getCost(event);
    if (!cost) {
      // only interested in cast events that spend resource
      return;
    }
    if (cost < 0) {
      debug && console.warn(`${this.owner.formatTimestamp(event.timestamp, 3)} Unexpected negative cost ${cost} for spell ${event.ability.guid}`);
    }
    if (!this.constructor.exemptFromRefund.includes(event.ability.guid)) {
      this.prevSpender = {
        id: event.ability.guid,
        cost,
        timestamp: event.timestamp,
      };
    }
    
    const shouldAccumulate = eventResource.amount == null ||
      this.constructor.castsToApplyCumulatively.includes(event.ability.guid) ||
      this.isLastUpdateRecent(event.timestamp);
    const current = (shouldAccumulate ? this.predictValue(event.timestamp) : eventResource.amount) - cost;
    if (debug && !shouldAccumulate) {
      this.debugActualVsPredicted(eventResource.amount, event.timestamp);
    }
    const max = this.currentMaxResourceWithFallback(event);
    this.updateState(current, max);
  }

  on_byPlayer_damage(event) {
    // only interested in damage events if they show a spending ability failing to connect (and so triggering a refund)
    if (!this.prevSpender || event.ability.guid !== this.prevSpender.id ||
        (event.timestamp - this.prevSpender.timestamp) > REFUND_SPENDER_WINDOW ||
        event.tick || !HIT_TYPES_THAT_REFUND.includes(event.hitType)) {
      return;
    }
    verboseDebug && console.log(`${this.owner.formatTimestamp(this.owner.currentTimestamp, 3)} attack didn't connect so restoring ${Math.round(this.constructor.resourceRefundOnMiss * 100)}% resource`);
    const refund = Math.floor(this.prevSpender.cost * this.constructor.resourceRefundOnMiss);
    const current = this.predictValue(event.timestamp) + refund;
    this.updateState(current);
  }

  on_toPlayer_drain(event) {
    if(event.resourceChangeType !== this.constructor.resourceType.id || !event.resourceChange) {
      return;
    }
    const eventResource = this.getResource(event);
    const drain = this.getReducedDrain(event);
    
    const shouldAccumulate = !eventResource || eventResource.amount == null ||
      this.constructor.energizersToApplyCumulatively.includes(event.ability.guid) ||
      this.isLastUpdateRecent(event.timestamp);
    
    // eventResource.amount for a drain is the value before the change
    const current = (shouldAccumulate ? this.predictValue(event.timestamp) : eventResource.amount) - drain;
    if (debug && !shouldAccumulate) {
      this.debugActualVsPredicted(eventResource.amount, event.timestamp);
    }
    const max = this.currentMaxResourceWithFallback(event);
    this.updateState(current, max);
  }

  isLastUpdateRecent(timestamp) {
    return this.regenState.timestamp + this.constructor.cumulativeEventWindow >= timestamp;
  }

  on_toPlayer_applybuff(event) {
    if (this.constructor.buffsChangeMax.includes(event.ability.guid)) {
      this.buffChangesResourceMax(event);
    }
    if (this.constructor.buffsChangeRegen.includes(event.ability.guid)) {
      this.buffChangesRegen();
    }
  }

  on_toPlayer_removebuff(event) {
    if (this.constructor.buffsChangeMax.includes(event.ability.guid)) {
      this.buffChangesResourceMax(event);
    }
    if (this.constructor.buffsChangeRegen.includes(event.ability.guid)) {
      this.buffChangesRegen();
    }
  }

  on_toPlayer_changehaste() {
    const regen = this.naturalRegenRate();
    this.updateState(null, null, regen);
  }

  buffChangesResourceMax(event) {
    const max = this.currentMaxResourceWithFallback(event);
    this.updateState(null, max);
  }

  buffChangesRegen() {
    const regen = this.naturalRegenRate();
    this.updateState(null, null, regen);
  }
  
  /**
   * Called when current, max, or regen rate for the resource has changed.
   * Builds a new regenState reflecting the current state.
   * Detects if resource capping occurred since the last regenState.
   * @param {number} amount Current amount of resource, or null to use prediction.
   * @param {number} max Current resource maximum, or null to use calculation.
   * @param {number} regen Current resource regeneration rate, or null to use calculation.
   */
  updateState(amount = null, max = null, regen = null) {
    const timestamp = this.owner.currentTimestamp;
    verboseDebug && console.log(`${this.owner.formatTimestamp(timestamp, 3)} amount: ${amount ? amount.toFixed(1) : 'n/a'}, max: ${max ? max.toFixed(1) : 'n/a'} , regen: ${regen ? (regen * 1000).toFixed(3) : 'n/a'}`);
    if (amount == null || isNaN(amount)) {
      amount = this.predictValue(timestamp);
    }
    if (max == null || isNaN(max)) {
      max = this.currentMaxResourceWithFallback();
    }
    if (regen == null || isNaN(regen)) {
      regen = this.naturalRegenRate();
    }
    amount = max ? Math.min(max, amount) : amount;
    const oldState = this.regenState;
    const newState = {
      amount,
      max,
      regen,
      timestamp,
    };
    this.regenState = newState;
    if (oldState) {
      const durationCapped = this.timeCappedBetweenStates(oldState, newState);
      this.atCap += durationCapped;
      this.missedRegen += durationCapped * oldState.regen;      
      this.naturalRegen += (newState.timestamp - oldState.timestamp) * oldState.regen;
    }
    if (newState.amount < newState.max) {
      this.onBelowCap(newState.timestamp);
    }
  }
  
  timeCappedBetweenStates(oldState, newState) {
    if (!oldState || !newState){
      throw new Error(`timeCappedBetweenStates called without required parameters. oldState: ${oldState}, newState: ${newState}`);
    }
    const reachCap = oldState.max ? this.predictReachValue(oldState.timestamp, oldState.amount, oldState.regen, oldState.max) : Infinity;
    if (reachCap >= newState.timestamp) {
      return 0;
    }
    this.onAtCap(reachCap);
    
    return newState.timestamp - reachCap;
  }

  currentMaxResourceWithFallback(event = null) {
    const calculated = this.currentMaxResource();
    if (calculated) {
      return calculated;
    }
    const eventResource = this.getResource(event);
    if (eventResource && eventResource.max != null && !isNaN(eventResource.max)) {
      return eventResource.max;
    }
    // when neither source provides a value just use the existing
    return this.regenState.max;
  }

  /**
   * Given a start value and regen rate, calculate when resource will reach a given value.
   * @param {number} startTime Timestamp for known resource value
   * @param {number} startValue Known resource value
   * @param {number} regen Regeneration rate in units per ms
   * @param {number} targetValue Resource value being aimed for
   * @returns {number} Timestamp when targetValue would be reached through natural regen.
   */
  predictReachValue(startTime, startValue, regen, targetValue) {
    if (startValue == null || isNaN(startValue) ||
        regen == null || isNaN(regen) ||
        targetValue == null || isNaN(targetValue) ||
        startTime == null || isNaN(startTime)) {
      throw new Error(`predictReachValue called without required parameters. startValue: ${startValue}, regen: ${regen}, cap: ${targetValue}, startTime: ${startTime}`);
    }
    if (startValue >= targetValue) {
      return startTime;
    }
    if (regen === 0) {
      return Infinity;
    }
    return startTime + ((targetValue - startValue) / regen);
  }

  /**
   * Calculates available resource accounting for natural regen.
   * @param {number} time Timestamp for which to create a prediction, or null for current timestamp.
   * @returns {number} Predicted resource value at given time.
   */
  predictValue(time = null) {
    if (!time) {
      time = this.owner.currentTimestamp;
    }
    if (time < this.regenState.timestamp) {
      debug && console.warn(`Attempting to predict the past. State's time: ${this.owner.formatTimestamp(this.regenState.timestamp, 3)}, target time: ${this.owner.formatTimestamp(time, 3)}`);
      return this.regenState.amount;
    }
    const elapsed = time - this.regenState.timestamp;
    const predicted = this.regenState.amount + this.regenState.regen * elapsed;
    return this.regenState.max ? Math.min(this.regenState.max, predicted) : predicted;
  }

  onBelowCap(time) {
    if (this.hasReportedBelowCap) {
      return;
    }
    this.fabricateEndCap(time);
    this.hasReportedBelowCap = true;
  }

  onAtCap(time) {
    if (!this.hasReportedBelowCap) {
      return;
    }
    this.fabricateBeginCap(time);
    this.hasReportedBelowCap = false;
  }

  /**
   * Fabricates an event indicating the tracked resource has reached its cap value.
   * May be triggered by an energize or natural regeneration bringing the value to the cap, or
   * by the cap being lowered.
   * 
   * Although the timestamp of this event should be accurate, because cap events are sometimes
   * only detected after they happen it may be misplaced within the event stream.
   * So do NOT assume that an event parsed between beginresourcecap and endresourcecap events
   * being parsed happened while the resource was capped. Either look at the timestamps of
   * the events or if you're interested in the current cap state use this analyzer's isCapped
   * 
   * Also note that endresourcecap and beginresourcecap events may occur extremely close to
   * one-another, sometimes on the same timestamp if there's a spend and energize event.
   * 
   * @param {number} time Timestamp for when the resource reached cap.
   */
  fabricateBeginCap(time) {
    if (time == null || isNaN(time)) {
      throw new Error(`fabricateBeginCap called without required parameter. time: ${time}`);
    }
    verboseDebug && console.log(`${this.owner.formatTimestamp(time, 3)} begin cap`);
    this.owner.fabricateEvent({
      type: 'beginresourcecap',
      timestamp: time,
      sourceID: this.owner.playerId,
      targetID: this.owner.playerId,
      resourceType: this.constructor.resourceType.id, 
    });
  }

  /**
   * Fabricates an event indicating that the tracked resource is no longer at its cap.
   * May be triggered by cast or drain using resource or the cap value being increased.
   * @param {number} time Timestamp for when the resource ceased to be at the cap.
   */
  fabricateEndCap(time) {
    if (time == null || isNaN(time)) {
      throw new Error(`fabricateEndCap called without required parameter. time: ${time}`);
    }
    verboseDebug && console.log(`${this.owner.formatTimestamp(time, 3)} end cap`);
    this.owner.fabricateEvent({
      type: 'endresourcecap',
      timestamp: time,
      sourceID: this.owner.playerId,
      targetID: this.owner.playerId,
      resourceType: this.constructor.resourceType.id, 
    });
  }

  // -- debug code to check accuracy of predictions against values reported by log
  debugErrorSum = 0;
  debugGreatestError = 0;
  debugAccuracyCheckCount = 0;
  debugActualVsPredicted(actual, timestamp) {
    if (!debug) {
      return;
    }
    const predicted = this.predictValue(timestamp);
    const difference = predicted - actual;
    const errorMagnitude = Math.abs(difference);
    this.debugGreatestError = Math.max(this.debugGreatestError, errorMagnitude);
    this.debugAccuracyCheckCount += 1;
    this.debugErrorSum += errorMagnitude;
    if (errorMagnitude > 3) {
      console.log(`${this.owner.formatTimestamp(timestamp, 3)} actual: ${actual} prediction: ${predicted.toFixed(1)} (error: ${difference > 0 ? '+' : ''}${difference.toFixed(1)})`);
    }
  }
  get debugMeanPredictionError() {
    return this.debugErrorSum / this.debugAccuracyCheckCount;
  }
}
export default RegenResourceCapTracker;
