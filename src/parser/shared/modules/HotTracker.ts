import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Combatant from 'parser/core/Combatant';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import Events, {
  AbilityEvent,
  AnyEvent,
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  FightEndEvent,
  HasTarget,
  HealEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
  TargettedEvent,
} from 'parser/core/Events';
import { EventType } from 'parser/core/Events';
import Combatants from 'parser/shared/modules/Combatants';
import Haste from 'parser/shared/modules/Haste';

/** Maximum duration of a refreshed HoT as a multiple of its original duration */
const PANDEMIC_FACTOR = 1.3;
/** Maximum increase to a refreshed HoT as a multiple of its original duration */
const PANDEMIC_EXTRA = 0.3;

/** tolerated difference between expected and actual HoT fall before a 'mismatch' is logged */
const EXPECTED_REMOVAL_THRESHOLD = 200;
/** tolerated latency between a buff remove and buff apply event for a bouncing hot */
const BOUNCE_THRESHOLD = 65;
// this class does a lot, a few different debug areas to cut down on the spam while debugging
const debug = false;
const bounceDebug = false;
const extensionDebug = false; // logs pertaining to extensions
const applyRemoveDebug = false; // logs tracking HoT apply / refresh / remove
const healDebug = false; // logs tracking HoT heals

/**
 * **HotTracker**
 *
 * **Motivation:** Many WoWAnalyzer modules seek to track the effects attributable to certain talents,
 * procs, legendaries, etc. Tracking direct damage / healing is easy because the events in question
 * happen immediately after the cast in question. For damage and healing over time effects (DoTs and HoTs),
 * things are more difficult. This module focuses on HoTs. This functionality will mostly be used by
 * Resto Druids as almost all of their healing is via HoTs, but this module will remain in core because
 * it also has some use for other specs.
 *
 * Whenever a HoT heals, we need a mechanism to trace that heal back to the effect or effects that 'caused' it.
 * There are four major factors this module tracks.
 * * Remaining duration - when a HoT is refreshed we need to know its remaining duration to know if it was clipped early.
 * * Procs - when a HoT is applied by a proc as opposed to being hardcast, we want to be able to attribute all healing caused by that proc
 * * Boosts - when a HoT has its healing boosted over its full duration, we want to be able to attribute all healing caused by that boost
 * * Extensions - when a HoT has its duration extended, we want to be able to attribute all healing caused by that extension.
 * We also need to track the extensions in order to able to correctly report remaining duration.
 *
 * **Functionality:** This abstract class should be extended by any healer spec that wishes to use it.
 * Info about that specific spec's available HoTs are loaded by the constructor. Outside modules must track
 * their assigned procs / boosts / extensions and call into HotTracker to 'inform it' of them. HotTracker
 * will then tally attributions in the passed in object which can be monitored by the caller. Further
 * detail can be found below in the function documentation.
 */
abstract class HotTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    haste: Haste,
  };

  combatants!: Combatants;
  haste!: Haste;

  /** Information about the tracked spec's available HoTs.
   * Loaded in the constructor by the overridden _generateHotInfo method */
  hotInfo: HotInfoMap;

  /** A mapping with tracker objects for each *currently active* HoT, indexed by player and spell */
  hots: TrackersByPlayerAndSpell = {};
  /** A listing of HoT trackers for HoTs we are currently waiting to 'bounce' */
  bouncingHots: Tracker[] = [];
  /** A history of all HoTs that have been tracked over the course of this encounter */
  hotHistory: Tracker[] = [];
  /** All registered refresh callbacks, indexed by spellId to watch */
  refreshHooks: { [key: number]: RefreshCallback[] } = {};
  /** All Attributions seen, indexed by name. */
  attributions: { [key: string]: Attribution } = {};

  constructor(options: Options) {
    super(options);

    // get dynamically generated HotInfos and read them into a mapping by spellId
    const hotInfoList: HotInfo[] = this._generateHotInfo().map((info) => {
      if (info.baseExtensions) {
        // filter extensions with no amount, and add amounts to the base duration
        let newDuration = this._getDuration(info);
        info.baseExtensions = info.baseExtensions.filter((e) => e.amount !== 0);
        info.baseExtensions.forEach((e) => {
          newDuration += e.amount;
          this.attributions[e.attribution.name] = e.attribution;
        });
        info.duration = newDuration;
      }
      return info;
    });
    if (!hotInfoList) {
      this.active = false;
    }
    this.hotInfo = {};
    hotInfoList.forEach((hi) => (this.hotInfo[hi.spell.id] = hi));

    // for each HoT we need the apply/refresh/remove buff events and also the heals
    const spellList = hotInfoList.map((hi) => hi.spell);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(spellList), this.hotApplied);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(spellList), this.hotHeal);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(spellList),
      this.hotReapplied,
    );
    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(spellList),
      this.hotReapplied,
    );
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(spellList), this.hotRemoved);

    if (debug) {
      this.addEventListener(Events.fightend, this.onFightEndDebug);
    }
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // PUBLIC METHODS - To be called by users of HotTracker
  //

  /**
   * Creates and returns a new Attribution object.
   * Pass an attribution object in with addAttribution, addExtension, or addBoost in order to attribute healing.
   * @param name the name of the attribution - used as a key when detecting duplicate attributions
   */
  public static getNewAttribution(name: string): Attribution {
    return {
      name,
      healing: 0,
      procs: 0,
      totalExtension: 0,
    };
  }

  /** Look up a registered attribution by name */
  public getAttribution(name: string): Attribution | undefined {
    return this.attributions[name];
  }

  /**
   * Provides an attribution for a HoT application. All healing done by the HoT will be tallied
   * to the given attribution object.
   *
   * Typically, this will be added at the same time the HoT is applied. In order for an Attribution
   * to be addable, the Tracker for the given HoT must already be present. This means the module
   * adding this attribution MUST come after HotTracker in the processing order.
   *
   * @param attribution the Attribution object to attach
   * @param targetId the target ID with the HoT to attribute
   * @param spellId the spell ID of the HoT to attribute
   */
  public addAttribution(attribution: Attribution, targetId: number, spellId: number): void {
    if (!this.hots[targetId] || !this.hots[targetId][spellId]) {
      debug &&
        console.warn(
          `Tried to add attribution ${attribution.name} to targetId=${targetId}, spellId=${spellId}, but that HoT isn't recorded as present`,
        );
      return;
    }
    attribution.procs += 1;
    this.hots[targetId][spellId].attributions.push(attribution);
    debug &&
      console.log(
        `${this.hots[targetId][spellId].name} on ${targetId} @${this.owner.formatTimestamp(
          this.owner.currentTimestamp,
          1,
        )} attributed to ${attribution.name}`,
      );
    this.attributions[attribution.name] = attribution;
  }

  /**
   * Provides an attribution for a HoT application. All healing done by the HoT will be tallied
   * to the given attribution object.
   *
   * Typically this will be added at the same time the HoT is applied. In order for an Attribution
   * to be addable, the Tracker for the given HoT must already be present. This means the module
   * adding this attribution MUST come after HotTracker in the processing order.
   *
   * @param attribution the Attribution object to attach
   * @param event the event marking the application of the HoT to attribute.
   */
  public addAttributionFromApply(
    attribution: Attribution,
    event: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent,
  ): void {
    this.addAttribution(attribution, event.targetID, event.ability.guid);
  }

  /**
   * Extends a HoT and optionally attributes that extension.
   *
   * Healing done at the end of the HoT (the time due to the extension) will be tallied to the given Attribution.
   *
   * @param attribution the Attribution object to attach,
   *   or null which will still register an extension but not attach any particular attribution.
   * @param amount the amount of time to extend, in ms
   * @param targetId the target ID with the HoT to extend
   * @param spellId the spell ID of the HoT to extend
   * @param timestamp the current timestamp,
   *   used for checking vs. the maxDuration to determine if an extension is possible
   * @param tickClamps if the extension should be clamped to tick boundaries
   *   (see explanation in _calculateExtension)
   * @param pandemicClamps if the extension should be clamped by pandemic
   *   (see explanation in _calculateExtension)
   */
  public addExtension(
    attribution: Attribution | null,
    amount: number,
    targetId: number,
    spellId: number,
    timestamp: number = 0, // apparently only used w/ max duration?
    tickClamps: boolean = true,
    pandemicClamps: boolean = false,
  ): void {
    if (!this.hots[targetId] || !this.hots[targetId][spellId]) {
      extensionDebug &&
        console.warn(
          `Tried to add extension ${attribution === null ? 'NO-ATT' : attribution.name}
           to targetId=${targetId}, spellId=${spellId}, but that HoT isn't recorded as present`,
        );
      return;
    }

    const hot = this.hots[targetId][spellId];

    //double check if we can even extend in the first place
    if (hot.maxDuration !== undefined) {
      const timeOut = timestamp - hot.start;
      const timeLeft = hot.maxDuration - timeOut;
      const timeToAdd = Math.min(amount, timeLeft); //find the smaller one as this will be added
      amount = Math.max(timeToAdd, 0); //make sure we are not negative
    }

    const finalAmount = this._calculateExtension(amount, hot, tickClamps, pandemicClamps);
    hot.end += finalAmount;

    if (!attribution) {
      return;
    }
    /*
     * Some attributions (Convoke Spirits) can produce both full attributions and extensions,
     * if they overlap we could double count - avoid that by checking for existing full attribution
     */
    if (hot.attributions.includes(attribution)) {
      return;
    }

    this._addOrExtendExtension(hot, attribution, finalAmount);

    extensionDebug &&
      console.log(
        `${hot.name} on ${targetId} @${this.owner.formatTimestamp(
          this.owner.currentTimestamp,
          1,
        )} extended ${(finalAmount / 1000).toFixed(1)}s by ${attribution.name}`,
      );
    this.attributions[attribution.name] = attribution;
  }

  /**
   * Provides an attribution for a HoT boost (a percentage increase in healing done by the HoT).
   * All boosted healing done by the HoT will be tallied to the given Attribution.
   *
   * Typically this will be added at the same time the HoT is applied. In order for an Attribution
   * to be addable, the Tracker for the given HoT must already be present. This means the module
   * adding this attribution MUST come after HotTracker in the processing order.
   *
   * @param attribution the Attribution object to attach
   * @param boostAmount the amount the HoT is boosted by.
   *   Should be the increase not the multiplier, so for a 50% boost you'd pass in 0.5.
   * @param targetId the target ID with the HoT to boost
   * @param spellId the spell ID of the HoT to boost
   */
  public addBoost(
    attribution: Attribution,
    boostAmount: number,
    targetId: number,
    spellId: number,
  ): void {
    if (!this.hots[targetId] || !this.hots[targetId][spellId]) {
      debug &&
        console.warn(
          `Tried to add boost ${attribution.name} to targetId=${targetId}, spellId=${spellId}, but that HoT isn't recorded as present`,
        );
      return;
    }
    attribution.procs += 1;

    const boost: Boost = {
      increase: boostAmount,
      attribution,
    };
    this.hots[targetId][spellId].boosts.push(boost);
    debug &&
      console.log(
        `${this.hots[targetId][spellId].name} on ${targetId} @${this.owner.formatTimestamp(
          this.owner.currentTimestamp,
          1,
        )} boosted ${boostAmount * 100}% by ${attribution.name}`,
      );
    this.attributions[attribution.name] = attribution;
  }

  /**
   * Provides an attribution for a HoT boost (a percentage increase in healing done by the HoT).
   * All boosted healing done by the HoT will be tallied to the given Attribution.
   *
   * Typically this will be added at the same time the HoT is applied. In order for an Attribution
   * to be addable, the Tracker for the given HoT must already be present. This means the module
   * adding this attribution MUST come after HotTracker in the processing order.
   *
   * @param attribution the Attribution object to attach
   * @param boostAmount the amount the HoT is boosted by.
   *   Should be the increase not the multiplier, so for a 50% boost you'd pass in 0.5.
   * @param event the event marking the application of the HoT to boost.
   */
  public addBoostFromApply(
    attribution: Attribution,
    boostAmount: number,
    event: ApplyBuffEvent | RefreshBuffEvent | ApplyBuffStackEvent,
  ): void {
    this.addBoost(attribution, boostAmount, event.targetID, event.ability.guid);
  }

  /**
   * Adds a function to be called when a HoT is refreshed.
   * The function will be given much of HotTracker's internal information about the refresh,
   * including time remaining on previous application, duration clipped (if any), and attributions
   * on the refresh.
   *
   * @param spellId the ID of the HoT to watch. This spell must be part of HotTracker's track list.
   * @param callback the function to call when the HoT is refreshed.
   */
  public addRefreshHook(spellId: number, callback: RefreshCallback): void {
    if (!this.hotInfo[spellId]) {
      console.error(
        `Tried to add refresh hook for spellId=${spellId}, but that is not a tracked HoT Id!`,
      );
    }

    if (!this.refreshHooks[spellId]) {
      this.refreshHooks[spellId] = [];
    }
    this.refreshHooks[spellId].push(callback);
    debug && console.info(`Added refresh hook for spellId=${spellId}`);
  }

  // TODO any utility in adding apply / remove hooks? Does HotTracker have more information about
  //      these that would be useful to consumers?

  /**
   * Gets how many of a specific HoT are currently active.
   *
   * @param spellId the ID of the HoT to count
   */
  public getHotCount(spellId: number): number {
    return Object.values(this.hots).flatMap((trackerBySpell) =>
      Object.values(trackerBySpell).filter((tracker) => tracker.spellId === spellId),
    ).length;
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // PROTECTED METHOD - Must be overridden by spec's implementation of HotTracker
  //

  /**
   * Called on construction to dynamically generate HoT info (depending on talents and what not).
   */
  abstract _generateHotInfo(): HotInfo[];

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // PRIVATE METHODS - Outside classes shouldn't touch these
  //

  /** Handles an apply buff for one of the tracked HoTs */
  hotApplied(event: ApplyBuffEvent) {
    // ensure this is a target we care about and everything is in a good state
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    if (!this._validateHot(event)) {
      return;
    }

    // if this is a HoT that just bounced, handle that
    if (this.hotInfo[spellId].bouncy && this.bouncingHots.length !== 0) {
      if (!this.hots[targetId]) {
        this.hots[targetId] = {};
      }
      while (this.bouncingHots.length > 0) {
        const hot = this.bouncingHots[0];
        const lastBounce = hot.lastBounce;
        if (lastBounce) {
          bounceDebug &&
            console.log(
              'Last Bounce: ' +
                this.owner.formatTimestamp(lastBounce, 3) +
                ', Event Timestamp: ' +
                this.owner.formatTimestamp(event.timestamp, 3),
            );
          //validate the bounce
          const timeBetween = event.timestamp - lastBounce;
          if (timeBetween <= BOUNCE_THRESHOLD) {
            bounceDebug &&
              console.log(
                'Applied a bouncing hot at ' +
                  this.owner.formatTimestamp(event.timestamp, 3) +
                  ' on ' +
                  this.combatants.getEntity(event)?.name,
              );
            //duration is not lost due to latency between events -- account for it
            hot.maxDuration! += timeBetween;
            hot.end += timeBetween;
            if (event.timestamp <= hot.originalEnd) {
              hot.originalEnd += timeBetween;
            }
            this.hots[targetId][spellId] = hot;
            this.bouncingHots.shift();
            return;
          }
          bounceDebug &&
            console.log(
              'Bouncing Hot lost due to no eligible jump targets, player death, expiration ' +
                this.owner.formatTimestamp(lastBounce, 3),
            );
          this.bouncingHots.shift();
        }
      }
    }

    // this is a new HoT - build and register a new tracker
    const hotDuration = this._getDuration(this.hotInfo[spellId]);
    const maxDuration = this._getMaxDuration(this.hotInfo[spellId]);
    const newHot: Tracker = {
      start: event.timestamp,
      end: event.timestamp + hotDuration,
      originalEnd: event.timestamp + hotDuration,
      lastTick: event.timestamp,
      spellId,
      name: event.ability.name,
      attributions: [],
      extensions: [],
      boosts: [],
      healingAfterOriginalEnd: 0,
      maxDuration,
      lastBounce: this.hotInfo[spellId].bouncy ? 0 : undefined,
    };

    if (!this.hots[targetId]) {
      this.hots[targetId] = {};
    }

    this._checkAndRegisterBaseExtensions(newHot);

    this.hots[targetId][spellId] = newHot;
    this.hotHistory.push(newHot);
  }

  /** Handles a heal by one of the tracked HoTs */
  hotHeal(event: HealEvent) {
    if (!event.tick) {
      return; // direct heal attributions need to be handled separately
    }
    // ensure this is a target we care about and everything is in a good state
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    if (!this._validateHot(event)) {
      return;
    }

    const healing = event.amount + (event.absorbed || 0);
    const hot = this.hots[targetId][spellId];

    // keep a tally of healing due to extensions in general
    if (
      hot.originalEnd < event.timestamp &&
      event.timestamp < hot.start + (hot.maxDuration ? hot.maxDuration : 0)
    ) {
      hot.healingAfterOriginalEnd += healing;
    }

    // tally proc attributions
    hot.attributions.forEach((att) => {
      att.healing += healing;
    });
    // tally boost attributions
    hot.boosts.forEach((boost: Boost) => {
      const boostAtt = boost.attribution;
      if (hot.attributions.includes(boostAtt)) {
        // Some effects (like Rampant Growth) can apply both full attributions and boosts
        // We want to avoid double counting if they overlap
        return;
      }
      boostAtt.healing += calculateEffectiveHealing(event, boost.increase);
    });
    // tally extension attributions
    this._tallyExtensions(hot, event);

    hot.lastTick = event.timestamp;
  }

  /** Handles a refresh buff for one of the tracked HoTs */
  hotReapplied(event: RefreshBuffEvent | ApplyBuffStackEvent) {
    // ensure this is a target we care about and everything is in a good state
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

    // update tracker info to account for the new projected falloff time
    const oldEnd = hot.end;
    const remaining = oldEnd - event.timestamp;
    const freshDuration = this._getDuration(this.hotInfo[spellId]);
    let clipped: number;
    if (this.hotInfo[spellId].refreshNoPandemic) {
      hot.end = event.timestamp + freshDuration; // no pandemic refreshes also seem to not tick clamp
      clipped = remaining;
    } else {
      hot.end += this._calculateExtension(freshDuration, hot, true, true);
      clipped = remaining - freshDuration * PANDEMIC_EXTRA;
    }

    // trigger refresh callbacks if needed
    if (this.refreshHooks[spellId]) {
      const refreshInfo = {
        oldRemaining: remaining,
        newRemaining: hot.end - event.timestamp,
        clipped,
      };
      this.refreshHooks[spellId].forEach((hook) => hook(event, refreshInfo));
    }

    // calculate if the HoT was refreshed early and take actions if it was
    if (clipped > 0) {
      // duration was clipped - this was an early refresh
      debug &&
        console.log(
          `${
            event.ability.name
          } on target ID ${targetId} was refreshed early @${this.owner.formatTimestamp(
            event.timestamp,
          )}, clipping ${(clipped / 1000).toFixed(1)}s`,
        );
      // Early refreshes potentially make HoT extensions irrelevant - for example if an effect extends a HoT's duration
      // by 6 seconds, but the HoT is then refreshed 2 seconds early, then effectively only 4 of those extensions seconds 'matter'.
      // We implement this by subtracting the clipped seconds extensions until the clip is 'used up'.
      hot.extensions.forEach((ext) => {
        if (clipped === 0) {
          return;
        }
        const extClipped = Math.min(clipped, ext.amount);
        clipped -= extClipped;
        ext.amount -= extClipped;

        extensionDebug &&
          console.log(
            `Extension ${ext.attribution.name} on ${
              event.ability.name
            } / ${targetId} @${this.owner.formatTimestamp(event.timestamp)} was clipped by ${(
              extClipped / 1000
            ).toFixed(1)}s`,
          );
      });
      hot.extensions.filter((ext) => ext.amount !== 0); // filter all HoTs clipped to nothing

      // TODO do more stuff about clipped HoT duration (a suggestion?). Only suggest for clipping hardcasts, of course.
    }

    const remainingExt = hot.extensions.reduce((acc, ext) => acc + ext.amount, 0);
    hot.originalEnd = hot.end - remainingExt; // reframe our info

    this._checkAndRegisterBaseExtensions(hot);

    // a new HoT application should overwrite any existing proc and boost attributions
    hot.attributions = [];
    hot.boosts = [];
    // extension attributions persist unless they were clipped (handled above)
  }

  /** Handles a removed buff for one of the tracked HoTs */
  hotRemoved(event: RemoveBuffEvent) {
    // ensure this is a target we care about and everything is in a good state
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    if (!this._validateHot(event)) {
      return;
    }

    if (this.hotInfo[spellId].bouncy && this.hots[targetId][spellId].end > event.timestamp) {
      // if this is a HoT that bounces, push it on to the bounce stack
      this.addAttribution(
        HotTracker.getNewAttribution('Bounced'),
        event.targetID,
        event.ability.guid,
      );
      this.hots[targetId][spellId].lastBounce = event.timestamp;
      this.bouncingHots.push(this.hots[targetId][spellId]);
      bounceDebug &&
        console.log(
          'Hot Bounced at ' +
            this.owner.formatTimestamp(
              Number(this.bouncingHots[this.bouncingHots.length - 1].lastBounce),
              3,
            ),
        );
    } else {
      // check removal time for logging
      this._checkRemovalTime(this.hots[targetId][spellId], event.timestamp, targetId);
    }
    // the HoT's gone and must be removed from tracking
    delete this.hots[targetId][spellId];
  }

  onFightEndDebug(_: FightEndEvent) {
    console.log('Attributions:');
    console.log(this.attributions);
    console.log('Current HoTs:');
    console.log(this.hots);
  }

  /**
   * Tallies healing attributable to extensions.
   * To do this, we only consider healing that takes place after a HoT's 'natural end'.
   *
   * Example: a HoT with a 10 second duration is applied at t=0. A 6 second extension is added to it.
   * The healing it does between t=10 and t=16 would be attributed to the extension.
   * If multiple differently attributed extensions are added to the same HoT, they are attributed in
   * the order they were applied.
   */
  _tallyExtensions(hot: Tracker, event: HealEvent) {
    if (event.timestamp <= hot.originalEnd) {
      return; // still in HoTs natural time period, nothing to tally
    }

    /*
     * For HoTs with slow tick rates, it's most correct to divvy up the tick to give an extension
     * only partial credit. We 'backwards attribute' ticks because HoTs always partial tick right
     * before they fall. We keep track of extension attributing by counting down the extension amount
     * in the extension track object.
     *
     * For Example:
     * Consider a HoT that originally ends at t=10, but then a 6 second extension is applied.
     * Imagine it ticks at a 3 second interval with ticks at ... t=9, 12, 15, 16 (partial).
     * This HoT does 100 HPS, meaning it heals for 300 each tick except for the partial t=16 tick which is for 100.
     * On the t=12 tick, we attribute 2/3 of the tick healing to the extension
     * and subtract 2 from the extension amount (2 seconds since t=10), leaving us with 4 seconds.
     * On the t=15 tick we attribute the full tick healing and subtract 3, leaving us with 1 second.
     * On the t=16 tick we attribute the full tick and subtract the final 1 second.
     * This leaves us with 200 + 300 + 100 = 600 healing attributed, which accurately represents
     * 6 seconds at 100 HPS.
     */

    const timeSinceOriginalEnd = event.timestamp - hot.originalEnd;
    const timeSinceLastTick = event.timestamp - hot.lastTick;
    let extension = Math.min(timeSinceOriginalEnd, timeSinceLastTick);
    const healingPerTime = (event.amount + (event.absorbed || 0)) / timeSinceLastTick;

    // go through extensions in order and attribute healing until extension amount is used up
    hot.extensions.forEach((ext) => {
      if (extension === 0) {
        return;
      }
      const extUsed = Math.min(extension, ext.amount);
      ext.attribution.healing += extUsed * healingPerTime;
      ext.amount -= extUsed;
      extension -= extUsed;
    });

    // remove used up extensions
    hot.extensions.filter((ext) => ext.amount !== 0);
  }

  /** Check if this HoT has any base extensions that apply to it, and add them if so */
  _checkAndRegisterBaseExtensions(hot: Tracker) {
    const extensions = this.hotInfo[hot.spellId]?.baseExtensions;
    if (!extensions) {
      return;
    }
    extensions.forEach((e) => this._addOrExtendExtension(hot, e.attribution, e.amount));
  }

  /** Apply the given extension amount attributed to the given Attribution to the given HoT */
  _addOrExtendExtension(hot: Tracker, attribution: Attribution, amount: number): void {
    attribution.procs += 1;
    attribution.totalExtension += amount;
    const existingExtension = hot.extensions.find(
      (extension) => extension.attribution.name === attribution.name,
    );
    if (existingExtension) {
      existingExtension.amount += amount;
    } else {
      hot.extensions.push({
        attribution,
        amount,
      });
    }
  }

  /**
   * Calculates the true extension amount for a HoT extension or refresh. Explanation follows.
   *
   * HoT extensions do not always extend by exactly the listed amount.
   * Instead, they are bound by the following two formulas, which this function implements:
   *
   * 1) The 'pandemic' window - naturally refreshed HoTs can only extend themselves to 1.3x their
   * original max duration.
   *
   * Example: Player applies a 10 second HoT to an ally, then 4 seconds later refreshes that HoT.
   * The original HoT has 6 seconds remaining, which added to the 10 seconds of the refresh would
   * be 16 seconds. However, 1.3 x 10 = 13, so the true remaining duration will be 13 seconds.
   *
   * 2) Clamping to nearest tick - add the raw extension amount to the current time remaining on the HoT,
   * then round to the nearest whole number of ticks (with respect to haste) to get the actual extension amount.
   * Note that as most tick periods scale with haste, this rounding effectively works on a snapshot
   * of the player's haste at the moment of the extension.
   *
   * Example: The player casts Flourish (raw extension = 6 seconds), extending a Rejuvenation with 5.4s remaining.
   * The player's current haste is 20%, meaning rejuv's current tick period = 3 / (1 + 0.2) = 2.5
   * Time remaining after raw extension = 5.4 + 6 = 11.6
   * Ticks remaining after extension, before rounding = 11.6 / 2.5 = 4.64
   * Round(4.64) = 5 ticks => 5 * 2.5 = 12.5 seconds remaining after extension and rounding
   * Effective extension amount = 12.6 - 5.4 = 7.2
   * Note that this can round up or down
   *
   * Thanks @tremaho for the detailed explanation of the tick clamping formula
   *
   * @param rawAmount the raw amount of the extension, in ms
   * @param hot the tracker for the HoT being extended
   * @param tickClamps true iff the tick clamping calculation should be applied
   * @param pandemicClamps true iff the pandemic clamping calculation should be applied
   * @return the calculated true amount of the extension
   */
  _calculateExtension(
    rawAmount: number,
    hot: Tracker,
    tickClamps: boolean,
    pandemicClamps: boolean,
  ): number {
    let amount = rawAmount;
    const currentTimeRemaining = hot.end - this.owner.currentTimestamp;

    let pandemicLog = '';
    if (pandemicClamps) {
      const newTimeRemaining = currentTimeRemaining + amount;
      const pandemicMax = this._getDuration(this.hotInfo[hot.spellId]) * PANDEMIC_FACTOR;
      if (newTimeRemaining > pandemicMax) {
        amount = pandemicMax - currentTimeRemaining;
        pandemicLog = `PANDEMIC:(remaining=${(pandemicMax / 1000).toFixed(2)}s)`;
      } else {
        pandemicLog = `PANDEMIC:(N/A)`;
      }
    }

    let tickLog = '';
    if (tickClamps) {
      let currentTickPeriod = this.hotInfo[hot.spellId].tickPeriod;
      if (!this.hotInfo[hot.spellId].noHaste) {
        currentTickPeriod /= 1 + this.haste.current;
      }
      const newTimeRemaining = currentTimeRemaining + amount;
      const newTicksRemaining = newTimeRemaining / currentTickPeriod;
      const newRoundedTimeRemaining = Math.round(newTicksRemaining) * currentTickPeriod;
      amount = newRoundedTimeRemaining - currentTimeRemaining;
      tickLog = `TICK:(period=${(currentTickPeriod / 1000).toFixed(2)}s)`;
    }

    // an extension can never reduce HoT's remaining duration, even after clamping
    amount = Math.max(0, amount);

    extensionDebug &&
      console.log(
        `${hot.name} w/ ${(currentTimeRemaining / 1000).toFixed(2)}s remaining gets ${(
          rawAmount / 1000
        ).toFixed(2)}s extension clamped by ${pandemicLog} ${tickLog} => actual: ${(
          amount / 1000
        ).toFixed(2)}s, new remaining: ${((amount + currentTimeRemaining) / 1000).toFixed(2)}s`,
      );

    return amount;
  }

  // Returns the difference between the timestamp and the expected removal time listed in the hot object.
  // Return will be positive if HoT actually ended after expected end (eg HoT lasted longer than expected).
  // Return will be negative if HoT actually ended before expected end (eg HoT lasted shorter than expected).
  // Logs when difference is over a certain threshold.
  _checkRemovalTime(hot: Tracker, actual: number, targetId: number) {
    const expected = hot.end;
    const diff = actual - expected;
    if (diff > EXPECTED_REMOVAL_THRESHOLD) {
      // The only reason HoT could last longer than expected is we are missing an extension, which is a bug -> log a warning
      extensionDebug &&
        console.warn(
          `${hot.name} on ${targetId} fell @${this.owner.formatTimestamp(actual, 1)}, which is ${(
            diff / 1000
          ).toFixed(1)}s LATER than expected... Missing an extension?`,
        );
    } else if (diff < -1 * EXPECTED_REMOVAL_THRESHOLD) {
      // Several legitimate reasons HoT could last shorter than expected: lifebloom swap, target dies, target was purged, target cancelled the spell -> log only when debug on
      extensionDebug &&
        console.warn(
          `${hot.name} on ${targetId} fell @${this.owner.formatTimestamp(actual, 1)}, which is ${-(
            diff / 1000
          ).toFixed(1)}s earlier than expected`,
        );
    }
    return diff;
  }

  // TODO remove this? It's mostly OBE by EventList and HasTarget
  // gets an event's target ... returns null if for any reason the event should not be further processed
  _getTarget(event: AnyEvent) {
    const target = this.combatants.getEntity(event);
    if (target === null || !HasTarget(event)) {
      return null; // target wasn't important (a pet probably)
    }

    const targetId = event.targetID;
    if (!targetId) {
      debug &&
        console.log(
          `${event.ability.name} ${event.type} to target without ID @${this.owner.formatTimestamp(
            event.timestamp,
            1,
          )}... HoT will not be tracked.`,
        );
      return null;
    } else {
      if (event.type === EventType.Heal) {
        healDebug &&
          console.log(
            `${event.ability.name} ${event.type} to ID ${targetId} @${this.owner.formatTimestamp(
              event.timestamp,
              1,
            )}`,
          );
      } else {
        applyRemoveDebug &&
          console.log(
            `${event.ability.name} ${event.type} to ID ${targetId} @${this.owner.formatTimestamp(
              event.timestamp,
              1,
            )}`,
          );
      }
    }

    return target;
  }

  /**
   * Returns true iff the HoT tracking involving this event is in the expected state.
   * If unexpected state is found, returns falso and logs an appropriate warning.
   */
  _validateHot(event: AbilityEvent<any> & TargettedEvent<any>) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;

    if (
      [EventType.RemoveBuff, EventType.RefreshBuff, EventType.Heal].includes(event.type) &&
      (!this.hots[targetId] || !this.hots[targetId][spellId])
    ) {
      debug &&
        console.warn(
          `${event.ability.name} ${
            event.type
          } on target ID ${targetId} @${this.owner.formatTimestamp(
            event.timestamp,
          )} but there's no record of that HoT being added...`,
        );
      return false;
    } else if (
      event.type === EventType.ApplyBuff &&
      this.hots[targetId] &&
      this.hots[targetId][spellId]
    ) {
      debug &&
        console.warn(
          `${event.ability.name} ${
            event.type
          } on target ID ${targetId} @${this.owner.formatTimestamp(
            event.timestamp,
          )} but that HoT is recorded as already added...`,
        );
      return false;
    }

    return true;
  }

  /** helper to extract a HoT's duration at time of application */
  _getDuration(hotInfo: HotInfo): number {
    const durationOrFunc = hotInfo.duration;
    return typeof durationOrFunc === 'number'
      ? durationOrFunc
      : durationOrFunc(this.selectedCombatant);
  }

  /** helper to extract a HoT's max duration at time of application */
  _getMaxDuration(hotInfo: HotInfo): number | undefined {
    const durationOrFunc = hotInfo.maxDuration;
    if (durationOrFunc === undefined) {
      return undefined;
    }
    return typeof durationOrFunc === 'number'
      ? durationOrFunc
      : durationOrFunc(this.selectedCombatant);
  }
}

/** A mapping from player ID and then spell ID to that player/spell's Tracker */
type TrackersByPlayerAndSpell = { [key: number]: TrackersBySpell };

/** A mapping from spell ID to that spell's Tracker */
export type TrackersBySpell = { [key: number]: Tracker };

/** a tracking object for a specific instance of the player's HoT on a target */
export interface Tracker {
  /** timestamp when the tracked HoT was applied */
  start: number;
  /** timestamp when the tracked HoT is projected to end (dynamically updated by extensions) */
  end: number;
  /** timestamp when the tracked HoT was originally projected to end (before extensions) */
  originalEnd: number;
  /** timestamp of the last heal tick (or the start timestamp if it hasn't ticked yet) */
  lastTick: number;
  /** the HoT's spellId */
  spellId: number;
  /** the HoT's name, for logging purposes */
  name: string;
  /** listing of attributions attached to this HoT */
  attributions: Attribution[];
  /** listing of extensions attached to this HoT */
  extensions: Extension[];
  /** listing of boosts attached to this HoT */
  boosts: Boost[];
  /** healing that occurred after the original end (can be attributed to extensions) */
  healingAfterOriginalEnd: number;
  /** if present, this is the 'true max duration' beyond which the HoT cannot be extended */
  maxDuration?: number;
  /** property used to track bouncy hots. Is set to 0 on initial application of a bouncy hot, and is set to the timestamp of the removebuff event associated with a hot that has bounced at least once.
   *  This should be left undefined for non-bouncy hots.*/
  lastBounce?: number;
}

/** a record of healing attributable to an effect */
export interface Attribution {
  /** the name of the attribution -
   * used as a key when detecting duplicate attributions */
  name: string;
  /** the amount of effective healing attributable - will be updated */
  healing: number;
  /** the number of times this attribution was made - will be updated */
  procs: number;
  /** the number of total milliseconds extended (for an extension attribution) */
  totalExtension: number;
}

/** a record of an extension to a HoT */
export interface Extension {
  /** the current length of the extension in ms - will tick down as an extension is 'consumed' */
  amount: number;
  /** the attribution of this extension */
  attribution: Attribution;
}

/** a record of a boost to a HoT (for its full duration) */
interface Boost {
  /** the amount of the healing increase - ex. 0.15 means a 15% increase */
  increase: number;
  /** the attribution of this boost */
  attribution: Attribution;
}

/** A mapping from spell ID to that spell's HotInfo */
type HotInfoMap = { [key: number]: HotInfo };

/** Information about a Heal over Time spell specific to tracking */
export interface HotInfo {
  /** The spell object for this HoT. This should be the spell for the buff/heal, not the cast. */
  spell: Spell;
  /** HoT's base duration, in ms. Either static or dynamically generated based on combatant state at time of application. */
  duration: number | ((c: Combatant) => number);
  /** HoT's base period between ticks, in ms. */
  tickPeriod: number;
  /** true iff the HoT's ticks are uneffected by haste - by default HoTs ARE effected by haste */
  noHaste?: boolean;
  /** true iff the HoT refreshes to its normal full duration (no pandemic extra) - by default HoTs do get up to an extra 30% from pandemic. */
  refreshNoPandemic?: boolean;
  /** Hot's maximum duration beyond which it cannot be extended, in ms. Either static or dynamically generated based on combatant state at time of application. */
  maxDuration?: number | ((c: Combatant) => number);
  /** true iff a HoT bounces - this is special case handling for Mistweaver's 'Renewing Mist' spell */
  bouncy?: boolean;
  /** the spell's ID again, for dynamic listeners */
  id?: number;
  /** the duration of the hot applied from an indirect source (i.e, a talent and not a hardcast) - special case handling for Mistweaver's hots from talents that aren't extended by Rising Mist */
  procDuration?: number | ((c: Combatant) => number);
  /** Extensions to HoT duration due to talents or other effects. Will be added to duration at load time */
  baseExtensions?: BaseExtension[];
}

/** an attributed extension to a HoT's base duration */
interface BaseExtension {
  /** The attribution to tracker to update */
  attribution: Attribution;
  /** The amount of extension to attribute, in ms.
   * Included BaseExtensions with amount = 0 will be automatically filtered. */
  amount: number;
}

/** A callback to be triggered when a HoT is refreshed */
type RefreshCallback = (event: RefreshBuffEvent | ApplyBuffStackEvent, info: RefreshInfo) => void;

/** Info about the refreshed HoT to be passed to the callback */
export interface RefreshInfo {
  /** The time that was remaining on the buff at the moment of the refresh, in ms */
  oldRemaining: number;
  /** The new time remaining on the buff after the refresh, in ms */
  newRemaining: number;
  /** The amount of time clipped due to an early refresh, in ms.
   *  This will be zero if the HoT can pandemic and the refresh was within the window */
  clipped: number;
}

export default HotTracker;
