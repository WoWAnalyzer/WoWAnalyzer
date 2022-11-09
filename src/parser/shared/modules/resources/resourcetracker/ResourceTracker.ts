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
 * The following is a real example found in a log - the following events happened on the same timestamp:
 * Ferocious Bite CAST - amount: 100, cost: 25
 * Ferocious Bite DRAIN - amount: 100, change: -25
 * Soul of the Forest ENERGIZE - amount: 90, change: 15
 *
 * As we can see, the DRAIN listed an amount from before the CAST, and the ENERGIZE listed an amount
 * from after the CAST but before the DRAIN. If we trusted the last seen amount, we'd say the
 * current energy is now 90, but in fact the true answer is 65.
 */
const MULTI_UPDATE_BUFFER_MS = 300;

/** hitType values that indicate an ability did not connect */
const REFUND_HIT_TYPES = [HIT_TYPES.MISS, HIT_TYPES.DODGE, HIT_TYPES.PARRY];

/** Data for a builder ability (one that generates resource) */
export type BuilderObj = {
  /** The total amount of resource generated */
  generated: number;
  /** The total amount of resource wasted (overcapped) */
  wasted: number;
  /** The total number of registered uses of the ability */
  casts: number;
};

/** Data for a spender ability (one that uses resource) */
export type SpenderObj = {
  /** The total cost of resource spent */
  spent: number;
  /** A list of the amount spent by each use of this ability */
  spentByCast: number[];
  /** The total number of registered uses of the ability */
  casts: number;
};

/** An update on the resource state */
type ResourceUpdate = {
  /** What triggered this update */
  type: ResourceUpdateType;
  /** This update's timestamp */
  timestamp: number;
  /** Instant change of resources with this update (negative indicates a spend or drain)
   *  This is the 'effective' change only, any overcap goes in changeWaste */
  change: number;
  /** Amount of resource the player has AFTER the change */
  current: number;
  /** Current resource max */
  max: number;
  /** Current rate of continuous resource gain, in resource per second */
  rate: number;
  /** Wasted resources caused by the instant change of resources */
  changeWaste: number;
  /** Wasted resources since the last update due to recharge */
  rateWaste: number;
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
  /** The fight ended */
  | 'fightEnd'
  /** A resource refund due to an ability miss */
  | 'refund';

const DEBUG = false;

/**
 * This is an 'abstract' implementation of a framework for tracking resource generating/spending.
 * Extend it by defining the resource and maxResource fields. Other functions can also be
 * overridden to handle unusual behavior - see comments in class for details.
 */
class ResourceTracker extends Analyzer {
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
  /** The maximum amount of the resource */
  maxResource!: number;

  /** Resource's base regeneration rate, in units per second. Leave as 0 for non-regenerating resources.
   *  For regenerating resources, override with the value appropriate to the spec/talents.
   *  If this rate can change for a non-haste reason *during* the encounter,
   *  use {@link triggerRateChange} in the implementation */
  baseRegenRate = 0;
  /** If the resource's regeneration is effected by haste. Override according to your spec */
  isRegenHasted = true;

  /** Some specs get partial resource refunds when a damaging ability fails to connect.
   *  Implementer should override this to true if that's the case for their spec/resource */
  refundOnMiss = false;
  /** The portion of resource that is refunded. This is the usual amount - override with something
   *  different if needed */
  refundOnMissAmount = 0.8;
  /** Some abilities (like AoE abilities) don't provide a refund when they don't connect.
   *  Override this with spellIds that don't refund. It's fine to leave this empty
   *  if refundOnMiss is being left as false. */
  refundBlacklist: number[] = [];

  // END override values

  /** Time ordered list of resource updates */
  resourceUpdates: ResourceUpdate[] = [];
  /** Tracked builders, indexed by spellId */
  buildersObj: { [index: number]: BuilderObj } = {};
  /** Tracked spenders, indexed by spellId */
  spendersObj: { [index: number]: SpenderObj } = {};

  /** Info about the last spender so we can apply a refund if it misses */
  lastSpenderInfo?: { timestamp: number; amount: number; spellId: number };

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.resourcechange.to(SELECTED_PLAYER), this.onEnergize);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.drain.to(SELECTED_PLAYER), this.onDrain);
    this.addEventListener(Events.ChangeHaste.to(SELECTED_PLAYER), this.onChangeHaste);
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  /** Manually adds a spell to the list of builder abilites.
   * Use to force a spell to show in results even if it wasn't used. */
  initBuilderAbility(spellId: number) {
    this.buildersObj[spellId] = { generated: 0, wasted: 0, casts: 0 };
  }
  /** Manually adds a spell to the list of spender abilites.
   * Use to force a spell to show in results even if it wasn't used. */
  initSpenderAbility(spellId: number) {
    this.spendersObj[spellId] = { spent: 0, spentByCast: [], casts: 0 };
  }

  /** The player's resource amount at the current timestamp */
  get current(): number {
    const lastUpdate = this.resourceUpdates.at(-1);
    if (!lastUpdate) {
      // there have been no updates so far, return a default
      return 0; // TODO make some resources default to max?
    }
    if (lastUpdate.rate === 0) {
      // resource doesn't naturally regenerate, so return the last seen val
      return lastUpdate.current;
    }
    // resource naturally regenerates, calculate current based on last seen val
    const timePassedSeconds = (this.owner.currentTimestamp - lastUpdate.timestamp) / 1000;
    const naturalGain = Math.round(timePassedSeconds * lastUpdate.rate); // whole number amount of resources pls
    return Math.min(lastUpdate.max, lastUpdate.current + naturalGain);
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
    const spellId = event.ability.guid;

    if (event.resourceChangeType !== this.resource.id) {
      return;
    }

    const waste = event.waste;
    const gain = event.resourceChange - waste;
    this._applyBuilder(spellId, gain, waste, event.timestamp, this.getResource(event));
  }

  /** Handles a DrainEvent (a resource loss - often used to implement "additional cost" effects).
   *  Pulls fields from the event to push an appropriate resource update. */
  onDrain(event: DrainEvent) {
    if (event.resourceChangeType !== this.resource.id) {
      return;
    }
    const resource = getResource(event.classResources, this.resource.id);
    this._resourceUpdate('drain', resource?.amount, resource?.max, event.resourceChange);
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
    if (this.baseRegenRate > 0) {
      this._resourceUpdate('fightEnd');
    }
  }

  /** Changes the base resource regeneration rate (before haste) to the given value,
   *  in resource per second */
  triggerRateChange(newRate: number) {
    this.baseRegenRate = newRate;
    this._resourceUpdate('rateChange');
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
    if (!this.buildersObj[spellId]) {
      this.initBuilderAbility(spellId);
    }

    this.buildersObj[spellId].wasted += waste;
    this.buildersObj[spellId].generated += gain;
    this.buildersObj[spellId].casts += 1;

    // resource.amount for an energize is the amount AFTER the energize
    const beforeAmount = !resource ? undefined : resource.amount - gain;
    this._resourceUpdate('gain', beforeAmount, resource?.max, gain, waste);
  }

  /** Pulls a cast's cost from its event fields. If an ability's true cost is different from what
   *  shows in an event, implementers should override this to return the correct number */
  getAdjustedCost(event: CastEvent): number | undefined {
    if (event.resourceCost && event.resourceCost[this.resource.id] !== undefined) {
      return event.resourceCost[this.resource.id];
    }
    return this.getResource(event)?.cost;
  }

  /** Handles a CastEvent, which typically lists resources spent.
   *  Pulls fields from the event and then calls {@link _applySpender}.
   *  Implementers that need to handle special cases may override this. */
  onCast(event: CastEvent) {
    const cost = this.getAdjustedCost(event);
    if (cost) {
      this._applySpender(event, cost, this.getResource(event));
    }
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

    if (!this.spendersObj[spellId]) {
      this.initSpenderAbility(spellId);
    }

    this.spendersObj[spellId].casts += 1;
    this.spendersObj[spellId].spentByCast.push(spent);
    if (spent > 0) {
      this.spendersObj[spellId].spent += spent;
    }

    // resource.amount for a spend is the amount BEFORE the spend
    const change = spent * -1;
    this._resourceUpdate('spend', resource?.amount, resource?.max, change);

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
   */
  _resourceUpdate(
    type: ResourceUpdateType,
    reportedBeforeAmount: number | undefined = undefined,
    reportedMax: number | undefined = undefined,
    change: number = 0,
    waste: number = 0,
  ) {
    const timestamp = this.owner.currentTimestamp;
    const max = !reportedMax ? this.maxResource : reportedMax;
    const prevUpdate = this.resourceUpdates.at(-1);

    // use the calculated before amount unless there's a reported amount
    // and we're outside the multi-update buffer
    const calculatedBeforeAmount = this.current;
    const withinMultiUpdateBuffer =
      prevUpdate && timestamp <= prevUpdate.timestamp + MULTI_UPDATE_BUFFER_MS;
    const beforeAmount =
      reportedBeforeAmount !== undefined && !withinMultiUpdateBuffer
        ? reportedBeforeAmount
        : calculatedBeforeAmount;
    const current = Math.min(max, beforeAmount + change); // current is the after amount

    // if our resource regenerates and we are now capped,
    // there was probably some rate-waste preceding this
    let rateWaste = 0;
    if (prevUpdate && this.currentRegenRate > 0 && beforeAmount >= max) {
      // find out what timestamp we capped on
      let capTimestamp = prevUpdate.atCap
        ? prevUpdate.timestamp
        : prevUpdate.timestamp + ((max - prevUpdate.current) / prevUpdate.rate) * 1000;
      if (capTimestamp > timestamp) {
        console.warn(
          `Rate Waste calc somehow calculated capTimestamp (${capTimestamp}) after the currentTimestamp (${timestamp})`,
        );
        capTimestamp = timestamp; // avoid attributing negative waste due to calc error...
      }
      // from the cap timestamp until the present timestamp, we were wasting resources
      rateWaste = ((timestamp - capTimestamp) / 1000) * prevUpdate.rate;

      // if prev update wasn't capped, we need to create an intermediate update showing
      // when we hit the cap
      if (!prevUpdate.atCap) {
        const capTimestamp =
          prevUpdate.timestamp + ((max - prevUpdate.current) / prevUpdate.rate) * 1000;
        this.logAndPushUpdate({
          type: 'regenCap',
          timestamp: capTimestamp,
          change: 0,
          current: max,
          max,
          rate: prevUpdate.rate,
          rateWaste: 0,
          changeWaste: 0,
          atCap: true,
        });
      }
    }

    this.maxResource = max;
    this.logAndPushUpdate(
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
      },
      calculatedBeforeAmount,
      reportedBeforeAmount,
      withinMultiUpdateBuffer,
    );
  }

  /** Pushes the given update to the updates list, and also logs useful stuff if DEBUG flag is set */
  logAndPushUpdate(
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
    this.resourceUpdates.push(update);
  }

  /** The resource's current regeneration rate */
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
    return (this.buildersObj[spellId] && this.buildersObj[spellId].generated) || 0;
  }

  /** Resource wasted by the given spell (will return 0 if there is no entry for the spell) */
  getWastedBySpell(spellId: number): number {
    return (this.buildersObj[spellId] && this.buildersObj[spellId].wasted) || 0;
  }

  /** Casts of the given spell (will return 0 if there is no entry for the spell) */
  getBuilderCastsBySpell(spellId: number): number {
    return (this.buildersObj[spellId] && this.buildersObj[spellId].casts) || 0;
  }

  /** Total resource generated */
  get generated(): number {
    return Object.values(this.buildersObj).reduce((acc, spell) => acc + spell.generated, 0);
  }

  /** Total resource wasted due to direct gains overcap */
  get gainWaste(): number {
    return Object.values(this.buildersObj).reduce((acc, spell) => acc + spell.wasted, 0);
  }

  /** Total resource wasted due to natural regeneration overcap */
  get rateWaste(): number {
    return this.resourceUpdates.reduce((acc, u) => acc + u.rateWaste, 0);
  }

  /** Total resource wasted (overcapped) */
  get wasted(): number {
    return this.gainWaste + this.rateWaste;
  }

  /** Time in milliseconds the player was at max resources */
  get timeAtCap(): number {
    if (this.resourceUpdates.length <= 1) {
      return 0;
    } else {
      let capTime = 0;
      for (let i = 1; i < this.resourceUpdates.length; i += 1) {
        if (this.resourceUpdates[i - 1].atCap) {
          capTime += this.resourceUpdates[i].timestamp - this.resourceUpdates[i - 1].timestamp;
        }
      }
      return capTime;
    }
  }

  /** Percent of the encounter the player was at max resources */
  get percentAtCap(): number {
    return this.timeAtCap / this.owner.fightDuration;
  }

  /** Total resource spent */
  get spent(): number {
    return Object.values(this.spendersObj).reduce((acc, spell) => acc + spell.spent, 0);
  }

  /** Total spender abilities cast */
  get spendersCasts(): number {
    return Object.values(this.spendersObj).reduce((acc, spell) => acc + spell.casts, 0);
  }
}

export default ResourceTracker;
