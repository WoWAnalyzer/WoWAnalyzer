import Spell from 'common/SPELLS/Spell';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatant from 'parser/core/Combatant';
import Events, {
  AbilityEvent,
  AnyEvent,
  ApplyBuffEvent,
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

// this class does a lot, a few different debug areas to cut down on the spam while debugging
const debug = false;
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

  constructor(options: Options) {
    super(options);

    // get dynamically generated HotInfos and read them into a mapping by spellId
    const hotInfoList: HotInfo[] = this._generateHotInfo();
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
    this.addEventListener(Events.removebuff.by(SELECTED_PLAYER).spell(spellList), this.hotRemoved);
  }

  /////////////////////////////////////////////////////////////////////////////////////////////////
  // PUBLIC METHODS - To be called by users of HotTracker
  //

  /**
   * Creates and returns a new Attribution object.
   * Pass an attribution object in with addAttribution, addExtension, or addBoost in order to attribute healing.
   * @param attributionId the spell ID being attributed. Will be used only for logging and display.
   * @param attributionName a name for the attribution. Will be used only for logging and display.
   */
  public getNewAttribution(attributionId: number, attributionName: string): Attribution {
    return {
      attributionId,
      name: attributionName,
      healing: 0,
      procs: 0,
      totalExtension: 0,
    };
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
      debug &&
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

    // TODO log the result
    if (!attribution) {
      return;
    }

    attribution.procs += 1;
    const existingExtension = hot.extensions.find(
      (extension) => extension.attribution.name === attribution.name,
    );
    if (existingExtension) {
      existingExtension.amount += finalAmount;
    } else {
      hot.extensions.push({
        attribution,
        amount: finalAmount,
      });
    }
    debug &&
      console.log(
        `${hot.name} on ${targetId} @${this.owner.formatTimestamp(
          this.owner.currentTimestamp,
          1,
        )} extended ${(finalAmount / 1000).toFixed(1)}s by ${attribution.name}`,
      );
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
        )} boosted ${boostAmount} by ${attribution.name}`,
      );
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
      this.hots[targetId][spellId] = this.bouncingHots[0];
      this.bouncingHots.shift();
      return;
    }

    // this is a new HoT - build and register a new tracker
    const hotDuration = this._getDuration(this.hotInfo[spellId]);
    const maxDuration = this._getMaxDuration(this.hotInfo[spellId]);
    const newHot = {
      start: event.timestamp,
      end: event.timestamp + hotDuration,
      originalEnd: event.timestamp + hotDuration,
      spellId, // stored extra here so I don't have to convert string to number like I would if I used its key in the object.
      name: event.ability.name, // stored for logging
      ticks: [], // listing of ticks w/ effective heal amount and timestamp, to be used as part of the HoT extension calculations
      attributions: [], // The effect or bonus that procced this HoT application. No attribution implies the spell was hardcast.
      extensions: [], // The effects or bonuses that caused this HoT to have extended duration. Format: { amount, attribution }
      boosts: [], // The effects or bonuses that caused the strength of this HoT to be boosted for its full duration.
      healingAfterOriginalEnd: 0, //healing this hot did after the base duration due to extensions
      maxDuration, //the true max duration that extensions will obey by (looking at rising mist)
    };

    if (!this.hots[targetId]) {
      this.hots[targetId] = {};
    }
    this.hots[targetId][spellId] = newHot;
    this.hotHistory.push(newHot);
  }

  /** Handles a heal by one of the tracked HoTs */
  hotHeal(event: HealEvent) {
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

    if (event.tick) {
      // direct healing (say from a PotA procced regrowth) still should be counted for attribution, but not part of tick tracking
      hot.ticks.push({ healing, timestamp: event.timestamp });
    }

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
      boost.attribution.healing += calculateEffectiveHealing(event, boost.increase);
    });

    // extension attributions aren't tallied until the HoT falls off
  }

  /** Handles a refresh buff for one of the tracked HoTs */
  hotReapplied(event: RefreshBuffEvent) {
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
    const freshDuration = this._getDuration(this.hotInfo[spellId]);
    hot.end += this._calculateExtension(freshDuration, hot, true, true);
    hot.originalEnd = hot.end; //reframe our info

    // calculate if the HoT was refreshed early and take actions if it was
    const remaining = oldEnd - event.timestamp;
    const clipped = remaining - freshDuration * PANDEMIC_EXTRA;
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
      // We implement this by subtracting the clipped seconds from all credited extensions.
      hot.extensions.forEach((ext) => {
        ext.amount -= clipped;
        extensionDebug &&
          console.log(
            `Extension ${ext.attribution.name} on ${
              event.ability.name
            } / ${targetId} @${this.owner.formatTimestamp(event.timestamp)} was clipped by ${(
              clipped / 1000
            ).toFixed(1)}s`,
          );
      });
      // TODO do more stuff about clipped HoT duration (a suggestion?). Only suggest for clipping hardcasts, of course.
    }

    // a new HoT application should overwrite any existing proc and boost attributions
    hot.attributions = [];
    hot.boosts = [];

    // we treat a refresh mostly as a "remove then refresh", so we'll tally extensions now too
    this._tallyExtensions(hot);
    hot.extensions = [];
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
      this.bouncingHots.push(this.hots[targetId][spellId]);
    } else {
      // otherwise it's time to tally the extension healing
      this._checkRemovalTime(this.hots[targetId][spellId], event.timestamp, targetId);
      this._tallyExtensions(this.hots[targetId][spellId]);
    }

    // the HoT's gone and must be removed from tracking
    delete this.hots[targetId][spellId];
  }

  /*
   * For each attributed extension on a HoT, tallies the granted healing
   */
  _tallyExtensions(hot: Tracker) {
    hot.extensions
      .filter((ext) => ext.amount > 0) // early refreshes can wipe out the effect of an extension, filter those ones out
      .forEach((ext) => this._tallyExtension(hot.ticks, ext.amount, ext.attribution));
  }

  _tallyExtension(ticks: Tick[], amount: number, attribution: Attribution) {
    const now = this.owner.currentTimestamp;

    let foundEarlier = false;
    let latestOutside = now;
    let healing = 0;
    // sums healing of every tick within 'amount',
    // also gets the latest tick outside the range, used to scale the healing amount
    for (let i = ticks.length - 1; i >= 0; i -= 1) {
      const tick = ticks[i];
      latestOutside = tick.timestamp;
      if (now - tick.timestamp > amount) {
        foundEarlier = true;
        break;
      }

      healing += tick.healing;
    }

    if (foundEarlier) {
      // TODO better explanation of why I need to scale direct healing
      const scale = amount / (now - latestOutside);
      attribution.healing += healing * scale;
      if (attribution.totalExtension !== undefined) {
        attribution.totalExtension += amount;
      }
    } else {
      // TODO error log, because this means the extension was almost all the HoT's duration? Check for an early removal of HoT.
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
      const currentTickPeriod = this.hotInfo[hot.spellId].tickPeriod / (1 + this.haste.current);
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
export type TrackersByPlayerAndSpell = { [key: number]: TrackersBySpell };

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
  /** the HoT's spellId */
  spellId: number;
  /** the HoT's name, for logging purposes */
  name: string;
  /** listing of ticks recorded by this HoT */
  ticks: Tick[];
  /** listing of attributions attached to this HoT */
  attributions: Attribution[];
  /** listing of extensions attached to this HoT */
  extensions: Extension[];
  /** listing of boosts attached to this HoT */
  boosts: Boost[];
  /** healing that occured after the original end (can be attributed to extensions) */
  healingAfterOriginalEnd: number;
  /** if present, this is the 'true max duration' beyond which the HoT cannot be extended */
  maxDuration?: number;
}

/** a record of a HoT's tick */
export interface Tick {
  /** the tick's effective healing */
  healing: number; //
  /** the tick's timestamp */
  timestamp: number; //
}

/** a record of healing attributable to an effect */
export interface Attribution {
  /** the ID of the effect attributed, or null in the case of a hardcast */
  attributionId: number | null;
  /** the name of the attribution, for logging purposes only */
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
  /** the length of the extension in ms */
  amount: number;
  /** the attribution of this extension */
  attribution: Attribution;
}

/** a record of a boost to a HoT (for its full duration) */
export interface Boost {
  /** the amount of the healing increase - ex. 0.15 means a 15% increase */
  increase: number;
  /** the attribution of this boost */
  attribution: Attribution;
}

/** A mapping from spell ID to that spell's HotInfo */
export type HotInfoMap = { [key: number]: HotInfo };

/** Information about a Heal over Time spell specific to tracking */
export interface HotInfo {
  /** The spell object for this HoT. This should be the spell for the buff/heal, not the cast. */
  spell: Spell;
  /** HoT's base duration, in ms. Either static or dynamically generated based on combatant state at time of application. */
  duration: number | ((c: Combatant) => number);
  /** HoT's base period between ticks, in ms. */
  tickPeriod: number;
  /** Hot's maximum duration beyond which it cannot be extended, in ms. Either static or dynamically generated based on combatant state at time of application. */
  maxDuration?: number | ((c: Combatant) => number);
  /** true iff a HoT bounces - this is special case handling for Mistweaver's 'Renewing Mist' spell */
  bouncy?: boolean;
  /** the spell's ID again, for dynamic listeners */
  id?: number;
}

export default HotTracker;
