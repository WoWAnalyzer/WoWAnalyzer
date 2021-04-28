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

const PANDEMIC_FACTOR = 1.3;
const PANDEMIC_EXTRA = 0.3;

// tolerated difference between expected and actual HoT fall before a 'mismatch' is logged
const EXPECTED_REMOVAL_THRESHOLD = 200;

// this class does a lot, a few different debug areas to cut down on the spam while debugging
const debug = false;
const extensionDebug = false; // logs pertaining to extensions
const applyRemoveDebug = false; // logs tracking HoT apply / refresh / remove
const healDebug = false; // logs tracking HoT heals

abstract class HotTracker extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    haste: Haste,
  };

  combatants!: Combatants;
  haste!: Haste;

  hotInfo: HotInfoMap;
  hotList: Spell[];

  hots: TrackersByPlayerAndSpell = {}; // a mapping of the currently tracked HoTs
  bouncingHots: Tracker[] = []; // a tracker for bouncing hots TODO used by MW - better desc?

  hotHistory: Tracker[] = []; // a history of all HoTs tracked over the course of this encounter

  constructor(options: Options) {
    super(options);
    this.hotInfo = this._generateHotInfo(); // some HoT info depends on traits and so must be generated dynamically
    this.hotList = this._generateHotList();
    if (!this.hotInfo) {
      this.active = false;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(this.hotList),
      this.hotApplied,
    );
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(this.hotList), this.hotHeal);
    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(this.hotList),
      this.hotReapplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(this.hotList),
      this.hotRemoved,
    );
  }

  hotApplied(event: ApplyBuffEvent) {
    const spellId = event.ability.guid;
    const target = this._getTarget(event);
    if (!target) {
      return;
    }
    const targetId = event.targetID;
    if (!this._validateHot(event)) {
      return;
    }

    if (this.hotInfo[spellId].bouncy && this.bouncingHots.length !== 0) {
      if (!this.hots[targetId]) {
        this.hots[targetId] = {};
      }
      this.hots[targetId][spellId] = this.bouncingHots[0];
      this.bouncingHots.shift();
      return;
    }

    let hotDuration = this.hotInfo[spellId].duration;
    const durationConditionsFunc = this.hotInfo[spellId].durationConditions;
    if (durationConditionsFunc !== undefined) {
      const c: Combatant = this.selectedCombatant;
      hotDuration = durationConditionsFunc(event, c);
    }

    let maxDuration = -1;
    const maxDurationFunc = this.hotInfo[spellId].maxDuration;
    if (maxDurationFunc !== undefined) {
      const c: Combatant = this.selectedCombatant;
      maxDuration = maxDurationFunc(event, c);
    }

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
      maxDuration: maxDuration, //the true max duration that extensions will obey by (looking at rising mist)
    };

    if (!this.hots[targetId]) {
      this.hots[targetId] = {};
    }
    this.hots[targetId][spellId] = newHot;
    this.hotHistory.push(newHot);
  }

  hotHeal(event: HealEvent) {
    const spellId = event.ability.guid;
    const target = this._getTarget(event);

    if (!target) {
      return;
    }
    const targetId = event.targetID;
    const healing = event.amount + (event.absorbed || 0);

    if (!this._validateHot(event)) {
      return;
    }
    const hot = this.hots[targetId][spellId];
    if (event.tick) {
      // direct healing (say from a PotA procced regrowth) still should be counted for attribution, but not part of tick tracking
      hot.ticks.push({ healing, timestamp: event.timestamp });
    }

    if (hot.originalEnd < event.timestamp && event.timestamp < hot.start + hot.maxDuration) {
      hot.healingAfterOriginalEnd += healing;
    }

    hot.attributions.forEach((att) => {
      att.healing += healing;
    });
    hot.boosts.forEach((boost: Boost) => {
      boost.attribution.healing += calculateEffectiveHealing(event, boost.increase);
    });

    // extensions handled when HoT falls, using ticks list
  }

  hotReapplied(event: RefreshBuffEvent) {
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
    let freshDuration = this.hotInfo[spellId].duration;
    const durationConditionsFunc = this.hotInfo[spellId].durationConditions;
    if (durationConditionsFunc !== undefined) {
      freshDuration = durationConditionsFunc(event, this.selectedCombatant);
    }
    hot.end += this._calculateExtension(freshDuration, hot, spellId, true, true);

    hot.originalEnd = hot.end; //reframe our info

    // seperately calculating if refresh was in pandemic, because for display to the player I want to avoid factoring in tick clipping...
    const remaining = oldEnd - event.timestamp;
    const clipped = remaining - freshDuration * PANDEMIC_EXTRA;
    if (clipped > 0) {
      debug &&
        console.log(
          `${
            event.ability.name
          } on target ID ${targetId} was refreshed early @${this.owner.formatTimestamp(
            event.timestamp,
          )}, clipping ${(clipped / 1000).toFixed(1)}s`,
        );
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

    hot.attributions = []; // new attributions on refresh

    this._tallyExtensions(hot);
    hot.extensions = [];

    hot.boosts = [];
  }

  hotRemoved(event: RemoveBuffEvent) {
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
      this.bouncingHots.push(this.hots[targetId][spellId]);
    } else {
      this._checkRemovalTime(this.hots[targetId][spellId], event.timestamp, targetId);
      this._tallyExtensions(this.hots[targetId][spellId]);
    }
    //delete hot no matter what
    delete this.hots[targetId][spellId];
  }

  /*
   * Adds an attribution to the HoT with the given spellId on the given targetId.
   * Attribution object passed in will be modified as the HoT heals, and must have the following fields:
   *    name: String (used only for logging)
   *    healing: Number (tallies the direct healing attributable)
   *    procs: Number (tallies the number of times this attribution was made)
   */
  addAttribution(attribution: Attribution, targetId: number, spellId: number) {
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

  /*
   * Extends the duration of the HoT with the the given spellId on the given targetId, and adds an attribution to that extension.
   * Attribution object passed in will be modified when the HoT expires, and must have the following fields:
   *    name: String (used only for logging)
   *    healing: Number (tallies the direct healing attributable)
   *    procs: Number (tallies the number of times this attribution was made)
   *    duration: Number (tallies the actual amount of extension applied, after clamping)
   * tickClamps and pandemicClamps specify if / how the extension should be clamped
   *
   * NOTE: can pass a null attribution to extend HoT without attributing it
   */
  addExtension(
    attribution: Attribution | null,
    amount: number,
    targetId: number,
    spellId: number,
    timestamp: number = 0, // apparently only used w/ max duration?
    tickClamps: boolean = true,
    pandemicClamps: boolean = false,
  ) {
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
    if (hot.maxDuration !== -1) {
      const timeOut = timestamp - hot.start;
      const timeLeft = hot.maxDuration - timeOut;
      const timeToAdd = Math.min(amount, timeLeft); //find the smaller one as this will be added
      amount = Math.max(timeToAdd, 0); //make sure we are not negative
    }

    const finalAmount = this._calculateExtension(amount, hot, spellId, tickClamps, pandemicClamps);
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
  _calculateExtension(
    rawAmount: number,
    hot: Tracker,
    spellId: number,
    tickClamps: boolean,
    pandemicClamps: boolean,
  ) {
    let amount = rawAmount;
    const currentTimeRemaining = hot.end - this.owner.currentTimestamp;

    let pandemicLog = '';
    if (pandemicClamps) {
      const newTimeRemaining = currentTimeRemaining + amount;
      const pandemicMax = this.hotInfo[spellId].duration * PANDEMIC_FACTOR;
      if (newTimeRemaining > pandemicMax) {
        amount = pandemicMax - currentTimeRemaining;
        pandemicLog = `PANDEMIC:(remaining=${(pandemicMax / 1000).toFixed(2)}s)`;
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

  // validates that event is for one of the tracked hots and that HoT tracking involving it is in the expected state
  _validateHot(event: AbilityEvent<any> & TargettedEvent<any>) {
    const spellId = event.ability.guid;
    const targetId = event.targetID;
    if (!this.hotInfo[spellId]) {
      return false; // we only care about the listed HoTs
    }

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

  /**
   * Called on construction to dynamically generate HoT info (depending on talents and what not).
   */
  abstract _generateHotInfo(): HotInfoMap;

  /**
   * Called on construction to dynamically generate a listing of HoT spells (depending on talents and what not).
   */
  abstract _generateHotList(): Spell[];
}

export type TrackersByPlayerAndSpell = { [key: number]: TrackersBySpell };

export type TrackersBySpell = { [key: number]: Tracker };

// a tracking object for a specific instance of the player's HoT on a target
export interface Tracker {
  start: number; // timestamp when the tracked HoT was applied
  end: number; // timestamp when the tracked HoT is projected to end (dynamically updated by extensions)
  originalEnd: number; // timestamp when the tracked HoT was originally projected to end (before extensions)
  spellId: number; // the HoT's spellId
  name: string; // the HoT's name, for logging purposes
  ticks: Tick[]; // listing of ticks recorded by this HoT
  attributions: Attribution[]; // listing of attributions attached to this HoT
  extensions: Extension[]; // listing of extensions attached to this HoT
  boosts: Boost[]; // listing of boosts attached to this HoT
  healingAfterOriginalEnd: number; // healing that occured after the original end (can be attributed to extensions)
  maxDuration: number; // the 'true max duration' that extensions will obey (see Rising Mist)
}

// a record of a HoT's tick
export interface Tick {
  healing: number; // the tick's effective healing
  timestamp: number; // the tick's timestamp
}

// a record of healing attributable to an effect
export interface Attribution {
  attributionId: number | null; // the ID of the effect attributed, or null in the case of a hardcast
  name: string; // the name of the attribution, for logging purposes only
  healing: number; // the amount of effective healing attributable - will be updated
  procs: number; // the number of times this attribution was made - will be updated
  totalExtension?: number; // the number of total milliseconds extended (for an extension attribution)
}

// a record of an extension to a HoT
export interface Extension {
  amount: number; // the length of the extension in ms
  attribution: Attribution; // the attribution of this extension
}

// a record of a boost to a HoT (for its full duration)
export interface Boost {
  increase: number; // the amount of the healing increase - ex. 0.15 means a 15% increase
  attribution: Attribution; // the attribution of this boost
}

// A mapping from spell ID to that spell's HotInfo
export type HotInfoMap = { [key: number]: HotInfo };

// information about a Heal over Time spell specific to tracking
export interface HotInfo {
  duration: number; //HoT's base duration, in ms
  tickPeriod: number; //HoT's base period between ticks, in ms
  maxDuration?: (e: ApplyBuffEvent, c: Combatant) => number; // TODO used by MW - description?
  bouncy?: boolean; // true iff a hot will bounce to another target on any event
  durationConditions?: (e: ApplyBuffEvent | RefreshBuffEvent, c: Combatant) => number; // TODO used by MW - description?
  id?: number; // the spell's ID again, for dynamic listeners
}

export default HotTracker;
