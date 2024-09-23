import { getResource, Resource } from 'game/RESOURCE_TYPES';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, {
  EventType,
  ClassResources,
  ResourceChangeEvent,
  CastEvent,
  HealEvent,
  SpendResourceEvent,
  DamageEvent,
  DrainEvent,
  BeginChannelEvent,
  AbilityEvent,
  SourcedEvent,
} from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Haste from 'parser/shared/modules/Haste';
import HIT_TYPES from 'game/HIT_TYPES';

/**
 * The time buffer in milliseconds within which resource updates should be combined
 * (rather than trusting the last 'amount' value in classResources)
 *
 * Explanation:
 * Normally, the `classResources.amount` field is an accurate report of the player's current
 * resource amount. However, when multiple updates happen in quick succession, the last amount can
 * be 'out of date', causing an incorrect calculation of the resource amount after the updates.
 *
 * This is a real example found in a log - the following events happened on the same timestamp:
 * Ferocious Bite CAST - amount: 100, cost: 25
 * Ferocious Bite DRAIN - amount: 100, change: -25
 * Soul of the Forest ENERGIZE - amount: 90, change: 15
 *
 * As we can see, the DRAIN listed an amount from before the CAST, and the ENERGIZE listed an amount
 * from after the CAST but before the DRAIN. If we trusted the last seen amount, we'd say the
 * current energy is now 90, but in fact the true answer is 65.
 */
const MULTI_UPDATE_BUFFER_MS = 150;

/** hitType values that indicate an ability did not connect */
const REFUND_HIT_TYPES = [HIT_TYPES.MISS, HIT_TYPES.DODGE, HIT_TYPES.PARRY];

/** Data for a builder ability (one that generates resource) */
type BuilderObj = {
  /** The total amount of resource generated */
  generated: number;
  /** The total amount of resource wasted (overcapped) */
  wasted: number;
  /** The total number of registered uses of the ability */
  casts: number;
};

/** Data for a spender ability (one that uses resource) */
type SpenderObj = {
  /** The total cost of resource spent */
  spent: number;
  /** A list of the amount spent by each use of this ability */
  spentByCast: number[];
  /** The total number of registered uses of the ability */
  casts: number;
};

/** An update on the resource state */
type ResourceUpdate = {
  /** What triggered this update (see {@link ResourceUpdateType} */
  type: ResourceUpdateType;
  /** This update's timestamp */
  timestamp: number;
  /** The spell ID associated with this update.
   *  Filled only for spend, drain, and gain types. */
  spellId?: number;
  /** Instant change of resources with this update (negative indicates a spend or drain)
   *  This is the 'effective' change only, any overcap goes in changeWaste.
   *  Undefined indicates no change. */
  change?: number;
  /** Amount of resource the player has AFTER the change */
  current: number;
  /** Current resource max */
  max: number;
  /** Current rate of continuous resource gain, in resource per second */
  rate: number;
  /** Wasted resources caused by the instant change of resources.
   *  Undefined indicates no change waste. */
  changeWaste?: number;
  /** Wasted resources since the last update due to natural regeneration.
   *  When this is defined, it implies the previous update was at cap.
   *  Undefined indicates no rate waste. */
  rateWaste?: number;
  /** True iff resources are capped AFTER the change */
  atCap: boolean;
};

type ResourceUpdateType =
  /** Player spent resource, as shown in a cast's classResources */
  | 'spend'
  /** Player drained resource, as shown in a DrainEvent */
  | 'drain'
  /** Player gained resource, as shown in a ChangeResourceEvent */
  | 'gain'
  /** Resource capped due to natural regeneration */
  | 'regenCap'
  /** Regeneration rate changed */
  | 'rateChange'
  /** The fight (or segment) ended - used to show trailing rate waste */
  | 'end'
  /** A resource refund due to an ability miss */
  | 'refund';

const DEBUG = false;

/**
 * This is an 'abstract' implementation of a framework for tracking resource generating/spending.
 * Extend it by defining the resource and maxResource fields. Other functions can also be
 * overridden to handle unusual behavior - see comments in class for details.
 */
export default class ResourceTracker extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    haste: Haste,
    // Optional dependency for the `resourceCost` prop of events
    // spellResourceCost: SpellResourceCost,
  };
  protected eventEmitter!: EventEmitter;
  protected haste!: Haste;

  /////////////////////////////////////////////////////////////////////////////
  // Overrides - implementer must set these values in constructor!
  //

  /** The resource to track */
  resource!: Resource;
  /** The maximum amount of the resource.
   * This is only used as a starting value - it will be updated from event's classResources field. */
  maxResource!: number;
  /** The amount of resources you start the fight with. */
  initialResources = 0;

  /** Resource's base regeneration rate, in units per second. This is the value before haste.
   *  Leave as 0 for non-regenerating resources.
   *  For regenerating resources, override with the value appropriate to the spec/talents.
   *  If this rate can change for a non-haste reason *during* the encounter,
   *  you *must* use {@link triggerRateChange} rather than directly modifying this value
   *  in order for the resource updates to be built correctly. */
  baseRegenRate = 0;
  /** If the resource's regeneration is effected by haste. */
  isRegenHasted = true;

  /** Some specs get partial resource refunds when a damaging ability fails to connect.
   *  Implementer should override this to true if that's the case for their spec/resource */
  refundOnMiss = false;
  /** The portion of resource that is refunded. This is the usual amount - override with something
   *  different if needed */
  refundOnMissAmount = 0.8;
  /** Some abilities (like AoE abilities) don't provide a refund when they don't connect.
   *  Override this with spellIds that don't refund. It's fine to leave this empty
   *  when refundOnMiss is false. */
  refundBlacklist: number[] = [];
  /** Some specs (i.e. Enhancement Shaman's Maelstrom Weapon) allow for multiple gains within the same
   *  timestamp as a valid gain.
   */
  allowMultipleGainsInSameTimestamp = false;
  /** Instead of calculating resource as rounded numbers, use decimal precision for granularity.
   * This is needed for specs that have resource generation that isn't provided in whole numbers
   * eg. Evoker's Essence */
  useGranularity = false;
  /** amount of decimals to use for granularity */
  granularity = 2;
  /** If true, will adjust the resource amount to account for any mismatch between the previous
   *  update's current and the new current. */
  adjustResourceMismatch = false;
  // END override values

  /** Data object for the whole fight - updated during analysis */
  fightData: SegmentData;

  /** Info about the last spender so we can apply a refund if it misses */
  lastSpenderInfo?: { timestamp: number; amount: number; spellId: number };

  /** Info about the last builder, before the resource was generated */
  lastBuilderInfo?: { timestamp: number; amount: number; spellId: number };

  constructor(options: Options) {
    super(options);

    this.fightData = new SegmentData(this.owner.fight.start_time, this.owner.fight.end_time);

    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onEnergize);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.drain.to(SELECTED_PLAYER), this.onDrain);
    this.addEventListener(Events.ChangeHaste.to(SELECTED_PLAYER), this.onChangeHaste);
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  /////////////////////////////////////////////////////////////////////////////
  // Direct data accessors
  // (these used to be indepenent objects - names retained for backwards compatability)
  //

  /** Time ordered list of resource updates */
  get resourceUpdates(): ResourceUpdate[] {
    return this.fightData.updates;
  }

  /** Tracked builders, indexed by spellId */
  get buildersObj(): { [index: number]: BuilderObj } {
    return this.fightData.builders;
  }

  /** Tracked spenders, indexed by spellId */
  get spendersObj(): { [index: number]: SpenderObj } {
    return this.fightData.spenders;
  }

  /////////////////////////////////////////////////////////////////////////////
  // Setup stuff
  //

  /** Manually adds a spell to the list of builder abilites.
   * Use to force a spell to show in results even if it wasn't used. */
  initBuilderAbility(spellId: number) {
    if (!this.buildersObj[spellId]) {
      this.buildersObj[spellId] = { generated: 0, wasted: 0, casts: 0 };
    }
  }
  /** Manually adds a spell to the list of spender abilites.
   * Use to force a spell to show in results even if it wasn't used. */
  initSpenderAbility(spellId: number) {
    if (!this.spendersObj[spellId]) {
      this.spendersObj[spellId] = { spent: 0, spentByCast: [], casts: 0 };
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  // Builder and Spender handling
  //

  /**
   * Process a resource gain that doesn't show in events.
   * This internally registers the change but does NOT fabricate an event.
   * @param {number} spellId - The spellId to attribute the resource gain to
   * @param {number} amount - The raw amount of resources to gain
   * @param {number} timestamp - The timestamp this is occuring
   */
  processInvisibleEnergize(spellId: number, amount: number, timestamp: number) {
    const maxGain = this.maxResource !== undefined ? this.maxResource - this.current : amount;
    const gain = Math.min(amount, maxGain);
    const waste = Math.max(amount - maxGain, 0);
    this._applyBuilder(spellId, gain, waste, timestamp);
  }

  /** Handles a ResourceChangeEvent (a resource gain e.g. a builder),
   *  pulling fields from the event and then calling {@link _applyBuilder}.
   *  Implementers that need to handle special cases may override this. */
  onEnergize(event: ResourceChangeEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const gainAndWaste = this.getAdjustedGain(event);
    this._applyBuilder(
      event.ability.guid,
      gainAndWaste.gain,
      gainAndWaste.waste,
      event.timestamp,
      this.getResource(event),
    );
  }

  /** Handles a CastEvent (a resource spend e.g. a spender),
   *  pulling fields from the event and then calling {@link _applySpender}.
   *  Implementers that need to handle special cases may override this. */
  onCast(event: CastEvent) {
    const cost = this.getAdjustedCost(event);
    if (cost) {
      this._applySpender(event, cost, this.getResource(event));
    }
  }

  /** Handles a DrainEvent (a resource loss - often used to implement "additional cost" effects),
   *  pulling fields from the event to push an appropriate resource update. */
  onDrain(event: DrainEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const resource = getResource(event.classResources, this.resource.id);
    this._resourceUpdate(
      'drain',
      resource?.amount,
      resource?.max,
      event.resourceChange,
      0,
      event.ability.guid,
    );
  }

  onDamage(event: DamageEvent) {
    if (
      this.refundOnMiss &&
      !this.refundBlacklist.includes(event.ability.guid) &&
      !event.tick &&
      REFUND_HIT_TYPES.includes(event.hitType) &&
      this.lastSpenderInfo &&
      this.lastSpenderInfo.timestamp + MULTI_UPDATE_BUFFER_MS >= event.timestamp
    ) {
      const refund = this.refundOnMissAmount * this.lastSpenderInfo.amount;
      this._resourceUpdate('refund', undefined, undefined, refund);
    }
  }

  onChangeHaste() {
    if (this.baseRegenRate > 0 && this.isRegenHasted) {
      this._resourceUpdate('rateChange');
    }
  }

  onFightEnd() {
    this._resourceUpdate('end');
  }

  /** Changes the base resource regeneration rate (before haste) to the given value,
   *  in resource per second */
  triggerRateChange(newRate: number) {
    this.baseRegenRate = newRate;
    this._resourceUpdate('rateChange');
  }

  /** Multiplies the base resource regeneration rate by the given factor.
   *  A useful helper for handling the application of a regen modifying buff. */
  addRateMultiplier(rateMult: number) {
    this.triggerRateChange(this.baseRegenRate * rateMult);
  }

  /** Divides the base resource regeneration rate by the given factor.
   *  A useful helper for handling the removal of a regen modifying buff. */
  removeRateMultiplier(rateMult: number) {
    this.triggerRateChange(this.baseRegenRate / rateMult);
  }

  /**
   * Registers a builder use, updating the relevant builderObj with the given values
   * and pushing a resourceUpdate.
   * @param spellId ID to register the builder as
   * @param gain amount of resource gain to register
   * @param waste amount of resource waste (overcap) to register
   * @param timestamp timestamp on which this occured
   * @param resource associated class resource, if present.
   *   Used only to update current and max resources.
   */
  _applyBuilder(
    spellId: number,
    gain: number,
    waste: number,
    timestamp: number,
    resource?: ClassResources,
  ) {
    this.lastBuilderInfo = {
      timestamp: timestamp,
      amount: this.current,
      spellId: spellId,
    };

    // resource.amount for an energize is the amount AFTER the energize
    const beforeAmount = !resource ? undefined : resource.amount - gain;
    this._resourceUpdate('gain', beforeAmount, resource?.max, gain, waste, spellId);
  }

  /**
   * Registers a spender use, updating the relevant spenderObj with the given values,
   * pushing a resourceUpdate, and fabricating a SpendResourceEvent
   * @param event the event associated with this spender - needed for internal fields
   *   and for fabricating the SpendResourceEvent
   * @param spent amount of resource spent to register
   * @param resource associated class resource, if present.
   *   Used only to update current and max resources.
   */
  _applySpender(
    event: AbilityEvent<any> & SourcedEvent<any>,
    spent: number,
    resource?: ClassResources,
  ) {
    const spellId = event.ability.guid;

    this.lastSpenderInfo = {
      timestamp: event.timestamp,
      amount: spent,
      spellId: event.ability.guid,
    };

    // resource.amount for a spend is the amount BEFORE the spend
    const change = spent * -1;
    this._resourceUpdate('spend', resource?.amount, resource?.max, change, 0, spellId);

    const fabricatedEvent: SpendResourceEvent = {
      type: EventType.SpendResource,
      timestamp: event.timestamp,
      sourceID: event.sourceID,
      resourceChange: spent,
      resourceChangeType: this.resource.id,
      ability: event.ability,
      __fabricated: true,
    };
    this.eventEmitter.fabricateEvent(fabricatedEvent, event);
  }

  /**
   * Add to resource update list based on changes to gamestate
   * @param type kind of update this is
   * @param reportedBeforeAmount the reported amount of resource before this update
   * @param reportedMax the reported max resource
   * @param change the instant change in resource
   * @param waste the overcap waste in resource due to the instant change
   * @param spellId the spell ID to associate with the resulting gain, spend, or drain update
   */
  _resourceUpdate(
    type: ResourceUpdateType,
    reportedBeforeAmount: number | undefined = undefined,
    reportedMax: number | undefined = undefined,
    change: number = 0,
    waste: number = 0,
    spellId?: number,
  ) {
    const timestamp = this.owner.currentTimestamp;
    const max = !reportedMax ? this.maxResource : reportedMax;
    const prevUpdate = this.resourceUpdates.at(-1);

    // ignore rateChanges that happen before first spend/gain/drain - can cause bad inferences
    if (type === 'rateChange' && !prevUpdate) {
      return;
    }

    /* Use the calculated before amount unless there's a reported amount
     * and we're outside the multi-update buffer.
     * See MULTI_UPDATE_BUFFER_MS docs for more info on why this is needed */
    const calculatedBeforeAmount = this.current;
    const withinMultiUpdateBuffer =
      !this.allowMultipleGainsInSameTimestamp &&
      prevUpdate &&
      timestamp <= prevUpdate.timestamp + MULTI_UPDATE_BUFFER_MS;
    /** If 'useGranularity' is true we use 'calculatedBeforeAmount', since 'reportedBeforeAmount' will always return a rounded
     * amount, whilst 'calculatedBeforeAmount' will return the amount with the decimal precision specified by 'granularity'. */
    const beforeAmount =
      reportedBeforeAmount !== undefined && !withinMultiUpdateBuffer && !this.useGranularity
        ? reportedBeforeAmount
        : calculatedBeforeAmount;
    const current = Math.max(Math.min(max, beforeAmount + change), 0); // current is the after amount

    /** There may be a discrepancy between the previous update's current value and
     * the new current value due to the time elapsed since the last resource generation calculation.
     * This discrepancy can cause issues when plotting the resource graph.
     *
     * For instance, if prevUpdate.current = 100,
     * and beforeAmount = 110 with a change of -105,
     *
     * Ideally, the plot should show: 100 -> 110 -> 5
     * However, it displays: 100 -> 5, despite reporting a change of -105.
     *
     * To address this, we generate a new update using the beforeAmount as the current value.
     */
    if (
      this.adjustResourceMismatch &&
      prevUpdate &&
      prevUpdate.current < beforeAmount &&
      type === 'spend' &&
      change < 0
    ) {
      this._logAndPushUpdate({
        type: 'gain',
        timestamp: timestamp - (timestamp - prevUpdate.timestamp) / 2,
        change: beforeAmount - prevUpdate.current,
        current: beforeAmount,
        max,
        rate: this.currentRegenRate,
        rateWaste: 0,
        changeWaste: 0,
        atCap: false,
      });
    }

    // if our resource regenerates and the beforeAmount was capped,
    // then we were wasting resources due to natural regeneration
    let rateWaste = 0;
    if (prevUpdate && this.currentRegenRate > 0 && beforeAmount >= max) {
      // Calculate 'raw current resources' based on amount you would have if no cap
      const rawCurrent =
        prevUpdate.current + ((timestamp - prevUpdate.timestamp) * prevUpdate.rate) / 1000;
      // The rate waste is equal to the amount 'raw current' is over the maximum
      // If the actual regen rate is higher than this calculator thinks (like a missing haste buff),
      // we could end up calculating rawCurrent as below the max even though this event reported
      // the player as being at the max. We don't want to enter a negative rate waste so we'll
      // clamp it to zero.
      rateWaste = Math.max(0, rawCurrent - max);
      // if prev update wasn't capped, we need to create an intermediate update showing
      // when we hit the cap so that updates will show correctly when graphed and to allow
      // for easier segmentation
      if (!prevUpdate.atCap && rateWaste > 0) {
        // back calculate time we hit cap using rateWaste, rate, and the current timestamp
        const timeSinceCap = (rateWaste / prevUpdate.rate) * 1000;
        const capTimestamp = timestamp - timeSinceCap;
        this._logAndPushUpdate({
          type: 'regenCap',
          timestamp: capTimestamp,
          change: 0,
          current: max,
          max,
          rate: prevUpdate.rate,
          rateWaste: 0, // all the rate waste happens *after* this update
          changeWaste: 0,
          atCap: true,
        });
      }
    }

    this.maxResource = max;
    this._logAndPushUpdate(
      {
        type,
        timestamp,
        change,
        current,
        max,
        rate: this.currentRegenRate,
        rateWaste,
        changeWaste: waste,
        atCap: current === max,
        spellId,
      },
      calculatedBeforeAmount,
      reportedBeforeAmount,
      withinMultiUpdateBuffer,
    );
  }

  /** Pushes the given update to the updates list, and also logs useful stuff if DEBUG flag is set */
  _logAndPushUpdate(
    update: ResourceUpdate,
    calculatedBeforeAmount?: number,
    reportedBeforeAmount?: number,
    withinMultiUpdateBuffer?: boolean,
  ) {
    if (DEBUG) {
      let diffReport = '';
      if (calculatedBeforeAmount !== undefined && reportedBeforeAmount !== undefined) {
        diffReport = ` - calcAmount:${calculatedBeforeAmount} reportedAmount:${reportedBeforeAmount} withinBuffer:${withinMultiUpdateBuffer} ${
          !withinMultiUpdateBuffer
            ? ` unaccountedDiff:${reportedBeforeAmount - calculatedBeforeAmount}`
            : ''
        }`;
      }
      console.log(
        'Update for ' +
          this.resource.name +
          ' @ ' +
          this.owner.formatTimestamp(update.timestamp, 1) +
          diffReport,
        update,
      );
    }
    this.fightData._pushUpdate(update);
  }

  /** Pulls a cast's cost from its event fields. If an ability's true cost is different from what
   *  shows in an event, implementers should override this to return the correct number */
  getAdjustedCost(event: CastEvent): number | undefined {
    if (event.resourceCost && event.resourceCost[this.resource.id] !== undefined) {
      return event.resourceCost[this.resource.id];
    }
    return this.getResource(event)?.cost;
  }

  /** Pulls a resourcechange's gain and waste from its event fields. If an ability's true gain
   *  and/or waste is different from what shows in an event, implementers should override this to
   *  return the correct number. This will only be called for ResourceChangeEvents with
   *  a resourcetype that matches this tracker. */
  getAdjustedGain(event: ResourceChangeEvent): { gain: number; waste: number } {
    const waste = event.waste;
    const gain = event.resourceChange - waste;
    return { gain, waste };
  }

  /////////////////////////////////////////////////////////////////////////////
  // Getters
  //

  /** The player's resource amount at the current timestamp */
  get current(): number {
    const lastUpdate = this.resourceUpdates.at(-1);
    if (!lastUpdate) {
      // there have been no updates so far, return a default
      return this.initialResources;
    }
    if (lastUpdate.rate === 0) {
      // resource doesn't naturally regenerate, so return the last seen val
      return lastUpdate.current;
    }
    // resource naturally regenerates, estimate current based on last seen val
    const timePassedSeconds = (this.owner.currentTimestamp - lastUpdate.timestamp) / 1000;
    const naturalGain = this.useGranularity
      ? parseFloat((timePassedSeconds * lastUpdate.rate).toFixed(this.granularity))
      : Math.round(timePassedSeconds * lastUpdate.rate); // whole number amount of resources pls

    return Math.min(lastUpdate.max, lastUpdate.current + naturalGain);
  }

  /** The resource's regeneration rate at the current timestamp */
  get currentRegenRate() {
    return this.isRegenHasted ? this.baseRegenRate * (1 + this.haste.current) : this.baseRegenRate;
  }

  /** Gets the ClassResources from this event for the tracked resource (or undefined if not present) */
  getResource(
    event:
      | BeginChannelEvent
      | CastEvent
      | HealEvent
      | DamageEvent
      | ResourceChangeEvent
      | DrainEvent,
  ): ClassResources | undefined {
    return event?.classResources?.find((r) => r.type === this.resource.id);
  }

  /** Resource generated by the given spell (will return 0 if there is no entry for the spell) */
  getGeneratedBySpell(spellId: number): number {
    return this.fightData.generatedBySpell(spellId);
  }

  /** Resource wasted by the given spell (will return 0 if there is no entry for the spell) */
  getWastedBySpell(spellId: number): number {
    return this.fightData.wastedBySpell(spellId);
  }

  /** Casts of the given spell (will return 0 if there is no entry for the spell) */
  getBuilderCastsBySpell(spellId: number): number {
    return this.fightData.generatorCastsBySpell(spellId);
  }

  /** Total resource generated */
  get generated(): number {
    return this.fightData.builderGenerated;
  }

  /** Total resource wasted due to direct gains overcap */
  get gainWaste(): number {
    return this.fightData.gainWaste;
  }

  /** Total resource wasted due to natural regeneration overcap */
  get rateWaste(): number {
    return this.fightData.rateWaste;
  }

  /** Total resource wasted (overcapped) */
  get wasted(): number {
    return this.fightData.totalWaste;
  }

  /** Total resource spent */
  get spent(): number {
    return this.fightData.spent;
  }

  /** Percent of raw generated resources that were wasted - this is only from builders and does NOT include rate gain or rate waste */
  get percentWasted(): number {
    return this.fightData.percentWasted;
  }

  /** Total spender abilities cast */
  get spendersCasts(): number {
    return this.fightData.spendersCast;
  }

  /** Time in milliseconds the player was at max resources */
  get timeAtCap(): number {
    return this.fightData.timeAtCap;
  }

  /** Percent of the encounter the player was at max resources */
  get percentAtCap(): number {
    return this.fightData.percentAtCap;
  }

  /** Gets resource data for a specific segment of time
   *  @param startTime the segment's start time (inclusive).
   *    Will be clamped to fightStart if earlier than it.
   *  @param endTime the segment's end time (exclusive).
   *    Must be later than startTime and will be clamped to current time if later than it.
   * */
  generateSegmentData(startTime: number, endTime: number): SegmentData {
    if (endTime <= startTime) {
      throw new Error(
        `Tried to generate segment with endTime ${endTime} not after startTime ${startTime}`,
      );
    }

    if (startTime < this.fightData.startTimestamp) {
      console.warn(
        `Tried to generate segment with startTime @ ${startTime}, which is before fightStart @ ${this.fightData.startTimestamp}. Segment start will be clamped to fightStart.`,
      );
    }
    if (endTime > this.owner.currentTimestamp) {
      console.warn(
        `Tried to generate segment with endTime @ ${endTime}, which is after currentTime @ ${this.owner.currentTimestamp}. Segment end will be clamped to currentTime.`,
      );
    }

    const clampedStartTime = Math.max(startTime, this.fightData.startTimestamp);
    const clampedEndTime = Math.min(endTime, this.owner.currentTimestamp);

    const segmentData = new SegmentData(clampedStartTime, clampedEndTime);

    // true iff we have already added the first update inside the segment
    let addedFirstInside = false;
    // the most recent update before the end of the segment
    let lastBeforeEnd: ResourceUpdate | undefined;
    /* Filter all the resource updates to get only the ones within the segment.
     * We also need to handle two special cases:
     * - The rateWaste of the first update inside the segment counts waste since the last segment,
     *   which by definition came *before* the segment start. We only want the waste since the
     *   segment start, so we'll need to recalculate that value.
     * - An 'end' update needs to be fabricated at the end of the segment to account for any
     *   rate waste that happened after the last update inside the segment
     */
    this.resourceUpdates.forEach((u, ix) => {
      if (u.timestamp < clampedStartTime) {
        lastBeforeEnd = u;
      } else if (u.timestamp >= clampedStartTime && u.timestamp < clampedEndTime) {
        // we're inside the segment
        if (!addedFirstInside && (u.rateWaste || 0) > 0 && ix > 0) {
          // The first update inside the segment has rate waste, which counts waste since the prev
          // segment, which was before this segment's start time. We want to show only the waste
          // that happened inside the segment, so we'll recalculate rate waste as
          // time since segment start multiplied by the regeneration rate of prev update
          // Regen rate is the rate after an update, so we need to use the previous update's
          // rate in order to get the correct value for this time period.
          const modifiedUpdate = { ...u }; // copy because we don't want to modify the original data
          modifiedUpdate.rateWaste =
            ((u.timestamp - clampedStartTime) / 1000) * this.resourceUpdates[ix - 1].rate;
          segmentData._pushUpdate(modifiedUpdate);
          lastBeforeEnd = modifiedUpdate;
        } else {
          // inside the segment and no special cases, just push it to the list
          segmentData._pushUpdate(u);
          lastBeforeEnd = u;
        }
        addedFirstInside = true;
      }
    });

    if (!lastBeforeEnd) {
      // there were no resource updates happening before or during our segment - impossible to make meaningful data
      segmentData._pushUpdate({
        type: 'end',
        timestamp: clampedEndTime,
        change: 0,
        current: 0,
        max: this.maxResource,
        rate: this.currentRegenRate,
        changeWaste: 0,
        rateWaste: 0,
        atCap: false,
      });
    } else {
      // add end update with info from last update before the end time
      const rawResourcesAtEnd =
        lastBeforeEnd.current +
        (lastBeforeEnd.rate * (clampedEndTime - lastBeforeEnd.timestamp)) / 1000;
      const resourcesAtEnd = Math.min(lastBeforeEnd.max, rawResourcesAtEnd);
      const rateWasteToEnd = Math.max(0, rawResourcesAtEnd - lastBeforeEnd.max);
      segmentData._pushUpdate({
        type: 'end',
        timestamp: clampedEndTime,
        change: 0,
        current: resourcesAtEnd,
        max: lastBeforeEnd.max,
        rate: lastBeforeEnd.rate,
        changeWaste: 0,
        rateWaste: rateWasteToEnd,
        atCap: lastBeforeEnd.max === resourcesAtEnd,
      });
    }

    DEBUG && console.log('Segment Data: ', segmentData);

    return segmentData;
  }
}

/** Data for player resources over a segment of time
 *  and a lot of functions to do calculations on that data */
export class SegmentData {
  /** The start time of this segment */
  startTimestamp: number;
  /** The end time of this segment */
  endTimestamp: number;
  /** A timeline of updates to the resource state */
  updates: ResourceUpdate[] = [];
  /** Tracked builders, indexed by spellId.
   *  Technically redundant info with updates, but allows easier/faster data lookup. */
  builders: { [index: number]: BuilderObj } = {};
  /** Tracked spenders, indexed by spellId.
   * Technically redundant info with updates, but allows easier/faster data lookup. */
  spenders: { [index: number]: SpenderObj } = {};

  /** Constructs an empty segment with the given start and end times */
  constructor(startTimestamp: number, endTimestamp: number) {
    this.startTimestamp = startTimestamp;
    this.endTimestamp = endTimestamp;
  }

  /** Pushes a new update and also adds to the builders or spenders obj */
  _pushUpdate(update: ResourceUpdate) {
    this.updates.push(update);

    if (update.type === 'spend' && update.spellId !== undefined) {
      if (!this.spenders[update.spellId]) {
        this.spenders[update.spellId] = {
          spent: 0,
          spentByCast: [],
          casts: 0,
        };
      }
      const spenderObj = this.spenders[update.spellId];
      const spent = update.change ? -update.change : 0; // spender change always negative number
      spenderObj.spent += spent;
      spenderObj.spentByCast.push(spent);
      spenderObj.casts += 1;
    } else if (update.type === 'gain' && update.spellId !== undefined) {
      if (!this.builders[update.spellId]) {
        this.builders[update.spellId] = {
          generated: 0,
          wasted: 0,
          casts: 0,
        };
      }
      const builderObj = this.builders[update.spellId];
      builderObj.generated += update.change || 0;
      builderObj.wasted += update.changeWaste || 0;
      builderObj.casts += 1;
    }
  }

  /** The total amount of spender ability casts within this segment. */
  get spendersCast(): number {
    return Object.values(this.spenders).reduce((acc, spell) => acc + spell.casts, 0);
  }

  /** The total amount of resource spent within this segment.
   *  Drained resources are *not* counted as spent. */
  get spent(): number {
    return Object.values(this.spenders).reduce((acc, spell) => acc + spell.spent, 0);
  }

  /** The total number of builder ability casts within this segment. */
  get buildersCast(): number {
    return Object.values(this.builders).reduce((acc, spell) => acc + spell.casts, 0);
  }

  /** The total amount of resource generated by builders within this segment.
   *  Natural regeneration is *not* counted here. */
  get builderGenerated(): number {
    return Object.values(this.builders).reduce((acc, spell) => acc + spell.generated, 0);
  }

  /** The total amount of resource drained with this segment.
   *  Spent resources are *not* counted as drained */
  get drained(): number {
    return this.updates
      .filter((u) => u.type === 'drain')
      .reduce((acc, u) => acc - (u.change || 0), 0);
  }

  /** The total amount of wasted (overcap) resources from builders within this segment. */
  get gainWaste(): number {
    return Object.values(this.builders).reduce((acc, spell) => acc + spell.wasted, 0);
  }

  /** The total amount of wasted (overcap) resources due to natural regeneration within this segment. */
  get rateWaste(): number {
    return this.updates.reduce((acc, u) => acc + (u.rateWaste || 0), 0);
  }

  /** The total amount of wasted resources from both builders and natural regen within this segment. */
  get totalWaste(): number {
    return this.gainWaste + this.rateWaste;
  }

  // TODO - would be nice to also track rate gain / rate waste here, but needs some work because we
  //  don't currently track rate gain at all
  /** Percent of raw generated resources that were wasted - this is only from builders and does NOT include rate gain or rate waste */
  get percentWasted(): number {
    const rawTotal = this.builderGenerated + this.gainWaste;
    return rawTotal === 0 ? 0 : this.gainWaste / rawTotal;
  }

  /** The total amount of resource generated by the builder with the given spellId within this segment. */
  generatedBySpell(spellId: number): number {
    return (this.builders[spellId] && this.builders[spellId].generated) || 0;
  }

  /** The total amount of casts of the builder with the given spellId within this segment */
  generatorCastsBySpell(spellId: number): number {
    return (this.builders[spellId] && this.builders[spellId].casts) || 0;
  }

  /** The total amount of resource spent by the spender with the given spellId within this segment. */
  spentBySpell(spellId: number): number {
    return (this.spenders[spellId] && this.spenders[spellId].spent) || 0;
  }

  /** The total amount of resource wasted by the builder with the given spellId within this segment. */
  wastedBySpell(spellId: number): number {
    return (this.builders[spellId] && this.builders[spellId].wasted) || 0;
  }

  // no 'DrainedObj' due to legacy reason - add one?
  /** The total amount of resource drained by the drain effect with the given spellId within this segment */
  drainedBySpell(spellId: number): number {
    return this.updates
      .filter((u) => u.type === 'drain' && u.spellId === spellId)
      .reduce((acc, u) => acc - (u.change || 0), 0);
  }

  /** Time (in ms) within the segment the player was at max resources */
  get timeAtCap(): number {
    if (this.updates.length <= 1) {
      return 0;
    } else {
      let capTime = 0;
      for (let i = 1; i < this.updates.length; i += 1) {
        if (this.updates[i - 1].atCap) {
          capTime += this.updates[i].timestamp - this.updates[i - 1].timestamp;
        }
      }
      return capTime;
    }
  }

  /** Percent of the segment the player was at max resources (in range 0..1) */
  get percentAtCap(): number {
    return this.timeAtCap / (this.endTimestamp - this.startTimestamp);
  }
}
