import { formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  AnyEvent,
  CastEvent,
  ChangeHasteEvent,
  EventType,
  FightEndEvent,
  FilterCooldownInfoEvent,
  HasAbility,
  MaxChargesDecreasedEvent,
  MaxChargesIncreasedEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import EventEmitter from 'parser/core/modules/EventEmitter';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import type { Annotation } from 'parser/core/modules/DebugAnnotations';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import SPELLS from 'common/SPELLS';
import SpellUsableDebugDescription from './SpellUsable/SpellUsableDebugDescription';

const DEBUG = false;

const DEBUG_WHITELIST = [SPELLS.RUNE_1.id, SPELLS.RUNE_2.id, SPELLS.RUNE_3.id];

/** Margin in milliseconds beyond which we log errors if numbers don't line up */
const COOLDOWN_LAG_MARGIN = 150;

function spellName(spellId: number) {
  return maybeGetTalentOrSpell(spellId)?.name ?? '???';
}

/**
 * Info about a spell that is currently cooling down.
 * When a spell finishes coolding down, the CooldownInfo about it is deleted.
 * Spells without charges are considered to effectively have one charge.
 */
export interface CooldownInfo {
  /** Timestamp this cooldown started overall (not the most recent charge) */
  overallStart: number;
  /** Timestamp the most recent charge started cooling down */
  chargeStart: number;
  /** The duration of the spell's recharge time based on current conditions */
  currentRechargeDuration: number;
  /** The expected time of the next recharge based on current conditions */
  expectedEnd: number;
  /** The number of spell charges currently available
   * (for spells without charges this will always be zero) */
  chargesAvailable: number;
  /** The maximum number of charges this spell can have.
   * (for spells without charges this will always be one) */
  maxCharges: number;
}

/**
 * Comprehensive tracker for spell cooldown status
 */
class SpellUsable extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    abilities: Abilities,
  };
  protected eventEmitter!: EventEmitter;
  protected abilities!: Abilities;

  /** Trackers for currently active cooldowns.
   *  Spells that aren't on cooldown won't have an entry in this mapping */
  private _currentCooldowns: { [spellId: number]: CooldownInfo } = {};
  /** A global multiplier for the cooldown rate, also known as the 'modRate' */
  private _globalModRate: number = 1;
  /** Per-spell multipliers for the cooldown rate, also knowns as the 'modRate' */
  private _spellModRates: { [spellId: number]: number } = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.any, this.onEvent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.prefiltercd.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.ChangeHaste, this.onChangeHaste);
    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC QUERIES -
  // Methods other analyzers can use to query the state of a cooldown.
  // These are read-only and do not change state.
  //

  /**
   * Whether the spell can be cast. This is not the opposite of `isOnCooldown`!
   * A spell with 2 charges, 1 available and 1 on cooldown would be both
   * available and on cooldown at the same time.
   * @param spellId the spell's ID
   */
  public isAvailable(spellId: number): boolean {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(spellId)];
    if (!cdInfo) {
      return true; // spell isn't on cooldown, therefore it is available
    }
    return cdInfo.chargesAvailable > 0;
  }

  /**
   * Whether the spell is cooling down. This is not the opposite of `isAvailable`!
   * A spell with 2 charges, 1 available and 1 on cooldown would be both
   * available and on cooldown at the same time.
   * @param spellId the spell's ID
   */
  public isOnCooldown(spellId: number): boolean {
    // a cooldown info exists iff the spell is on cooldown
    return Boolean(this._currentCooldowns[this._getCanonicalId(spellId)]);
  }

  /**
   * The number of charges of the spell currently available.
   * For an available spell without charges, this will always be one.
   * @param spellId the spell's ID
   */
  public chargesAvailable(spellId: number): number {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(spellId)];
    if (!cdInfo) {
      return this.abilities.getMaxCharges(this._getCanonicalId(spellId)) || 1;
    }
    return cdInfo.chargesAvailable;
  }

  /**
   * The number of charges of the spell currently on cooldown
   * For an available spell without charges, this will always be zero.
   * @param spellId the spell's ID
   */
  public chargesOnCooldown(spellId: number): number {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(spellId)];
    if (!cdInfo) {
      return 0;
    }
    return cdInfo.maxCharges - cdInfo.chargesAvailable;
  }

  /**
   * The time for the spell to recover a full charge in the current conditions.
   * This is NOT the time until the spell comes off cooldown!
   * Actual duration can change based on haste, modRate, or CDR.
   * For spells without a cooldown, this will always be zero.
   * @param spellId the spell's ID
   */
  public fullCooldownDuration(spellId: number): number {
    return this._getExpectedCooldown(this._getCanonicalId(spellId));
  }

  /**
   * The expected amount of time remaining on the spell's cooldown (for its current charge).
   * For spells that aren't on cooldown, this will always return zero.
   * @param spellId the spell's ID
   * @param timestamp the timestamp to check from (if different from current timestamp)
   * @return time remaining on the cooldown, in milliseconds
   */
  public cooldownRemaining(
    spellId: number,
    timestamp: number = this.owner.currentTimestamp,
  ): number {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(spellId)];
    return !cdInfo ? 0 : cdInfo.expectedEnd - timestamp;
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC COOLDOWN MANIPULATION -
  // Methods other analyzers can use to implement cooldown effects.
  // These methods do change state!
  //

  /**
   * Begins the spell's cooldown (as though the spell was just cast).
   * This is called automatically when the spell is cast, but analyzers can override or manually
   * call this in order to handle special cases.
   * @param {AbilityEvent<any>} triggeringEvent the event that triggered the cooldown
   *     (typically a CastEvent)
   * @param spellId the spell's ID, if it is different from the triggeringEvent's ID.
   */
  public beginCooldown(
    triggeringEvent: AbilityEvent<any>,
    spellId: number = triggeringEvent.ability.guid,
  ) {
    const cdSpellId = this._getCanonicalId(spellId);
    const cdInfo = this._currentCooldowns[cdSpellId];
    this.recordCooldownDebugInfo(triggeringEvent, cdSpellId, cdInfo);
    if (!cdInfo) {
      // spell isn't currently on cooldown - start a new cooldown!
      const ability = this.abilities.getAbility(cdSpellId);
      if (!ability) {
        return; // no registered ability for this - assume no cooldown
      }

      const expectedCooldownDuration = this._getExpectedCooldown(cdSpellId);
      if (!expectedCooldownDuration) {
        return; // this ability doesn't have a cooldown
      }
      const maxCharges = this.abilities.getMaxCharges(ability) || 1;

      const newInfo: CooldownInfo = {
        overallStart: triggeringEvent.timestamp,
        chargeStart: triggeringEvent.timestamp,
        expectedEnd: triggeringEvent.timestamp + expectedCooldownDuration,
        currentRechargeDuration: expectedCooldownDuration,
        chargesAvailable: maxCharges - 1,
        maxCharges,
      };
      this._currentCooldowns[cdSpellId] = newInfo;
      this._fabricateUpdateSpellUsableEvent(
        UpdateSpellUsableType.BeginCooldown,
        cdSpellId,
        triggeringEvent.timestamp,
        newInfo,
      );
    } else if (cdInfo.chargesAvailable > 0) {
      // spell is on CD but has an available charge
      cdInfo.chargesAvailable -= 1;
      this._fabricateUpdateSpellUsableEvent(
        UpdateSpellUsableType.UseCharge,
        cdSpellId,
        triggeringEvent.timestamp,
        cdInfo,
      );
    } else {
      // trigger an end cooldown and then immediately a begin cooldown
      // we're treating this as a missed natural CD expiration, so pass true to 'reset cooldown'
      this.endCooldown(cdSpellId, triggeringEvent.timestamp, true);
      this.beginCooldown(triggeringEvent, spellId);
    }
  }

  /**
   * End the spell's cooldown (or for a spell with charges, restores one charge).
   * This is automatically called by this module when a spell's cooldown ends naturally.
   * This function should only be called externally to handle 'reset cooldown' or 'restore charge' effects.
   *
   * @param {number} spellId the spell's ID.
   * @param {number} timestamp the timestamp on which the cooldown ended,
   *     if different from currentTimestamp.
   * @param {boolean} resetCooldown if the cooldown's progress should be reset.
   *     This field is only relevant for spells with more than one charge.
   *     if true, a charge will be added and cooldown progress will be set back to zero.
   *     if false, a charge will be added and cooldown progress will be retained.
   *     'Restore charge' effects typically do not reset the cooldown (pass false to this field),
   *     while natural cooldown expiration and effects do (pass true to this field).
   * @param {boolean} restoreAllCharges if all charges should be restored rather than just one.
   *     This field is only relevant for spells with more than one charge.
   *     Most 'restore charge' effects restore only one charge, hence the default to false.
   */
  public endCooldown(
    spellId: number,
    timestamp: number = this.owner.currentTimestamp,
    resetCooldown: boolean = false,
    restoreAllCharges: boolean = false,
  ) {
    // get cooldown info
    const cdSpellId = this._getCanonicalId(spellId);
    const cdInfo = this._currentCooldowns[cdSpellId];
    if (!cdInfo) {
      // Nothing to end, the spell isn't on cooldown
      DEBUG &&
        console.info(
          'Tried to end cooldown of ' + spellName(spellId) + ", but it wasn't on cooldown",
        );
      return;
    }

    // restore charge(s)
    if (restoreAllCharges) {
      cdInfo.chargesAvailable = cdInfo.maxCharges;
    } else {
      cdInfo.chargesAvailable += 1;
    }

    // handles based on whether this was the last charge
    if (cdInfo.chargesAvailable === cdInfo.maxCharges) {
      // all charges restored - end the cooldown
      cdInfo.expectedEnd = timestamp; // expected in the event
      this._fabricateUpdateSpellUsableEvent(
        UpdateSpellUsableType.EndCooldown,
        cdSpellId,
        timestamp,
        cdInfo,
      );
      delete this._currentCooldowns[cdSpellId];
    } else {
      // intermediate charge restored - update info for new cooldown
      if (resetCooldown) {
        this._resetCooldown(cdSpellId, cdInfo, timestamp);
      }

      this._fabricateUpdateSpellUsableEvent(
        UpdateSpellUsableType.RestoreCharge,
        cdSpellId,
        timestamp,
        cdInfo,
      );
      // restore charge event needs to point to previous chargeStart, then we can update
      cdInfo.chargeStart = timestamp;
    }
  }

  /**
   * Reduces the time left on a cooldown by the given amount.
   * @param {number} spellId The ID of the spell.
   * @param {number} reductionMs The duration to reduce the cooldown by, in milliseconds.
   * @param {number} timestamp the timestamp on which the cooldown was reduced,
   *     if different from currentTimestamp.
   * @return {number} the effective cooldown reduction, in milliseconds.
   *     For example, if a spell's cooldown is reduced by 10 seconds, but the spell only has
   *     7 seconds left on the cooldown, '7 seconds' is the effective reduction.
   */
  public reduceCooldown(
    spellId: number,
    reductionMs: number,
    timestamp: number = this.owner.currentTimestamp,
  ): number {
    // get cooldown info
    const cdSpellId = this._getCanonicalId(spellId);
    const cdInfo = this._currentCooldowns[cdSpellId];
    if (!cdInfo) {
      // Nothing to reduce, the spell isn't on cooldown
      DEBUG &&
        console.info(
          'Tried to reduce cooldown of ' + spellName(spellId) + ", but it wasn't on cooldown",
        );
      return 0;
    }

    let effectiveReductionMs = reductionMs;
    /*
     * Applying a time-based reduction interacts differently with haste and modRate.
     * Haste does not scale the time-based reduction, while modRate does.
     * For example, consider a cooldown which can benefit from haste and modRate which has
     * a base cooldown of 8 seconds, and that as soon as it goes on cooldown its remaining cooldown
     * is reduced by 2 seconds.
     * Case 1: no haste or modRate : cooldown finishes at 6 seconds
     * Case 2: +100% haste, no modRate : cooldown finishes at 2 seconds
     * Case 3: no haste, +100% modRate : cooldown finishes at 3 seconds
     */
    // calculate and apply reduction
    const modRate = this._getSpellModRate(cdSpellId);
    const scaledReductionMs = reductionMs / modRate;
    cdInfo.expectedEnd -= scaledReductionMs;

    // if this restores a charge or ends the cooldown, we need to handle that
    if (timestamp >= cdInfo.expectedEnd) {
      const carryoverCdr = timestamp - cdInfo.expectedEnd;

      // calculate effective reduction based on unscaled amount
      if (cdInfo.maxCharges - cdInfo.chargesAvailable === 1) {
        // this reduction will end the cooldown, so some of it will be wasted
        const scaledEffectiveReduction = scaledReductionMs - carryoverCdr;
        effectiveReductionMs = scaledEffectiveReduction * modRate;
      }

      this._resetCooldown(cdSpellId, cdInfo, timestamp, carryoverCdr);
      this.endCooldown(spellId, timestamp); // we reset CD here, so don't want end cooldown to do it too
    }

    DEBUG &&
      console.log(
        'Reduced cooldown of ' +
          spellName(cdSpellId) +
          ' by ' +
          reductionMs +
          ' (effective:' +
          effectiveReductionMs +
          ') @ ' +
          this.owner.formatTimestamp(timestamp, 1) +
          ' (t=' +
          timestamp +
          ')',
      );

    return effectiveReductionMs;
  }

  /**
   * Change the rate at which a spell's cooldown recovers. By default,
   * cooldowns recover at a rate of 1, e.g. "one second per second".
   * Effects that increase (or decrease) the ability cooldown rate
   * (sometimes referred to as "modRate") can modify this.
   * @param {number | number[] | 'ALL'} spellId The ID or IDs of the spell to change,
   *     or 'ALL' if you want to change the cooldown rate of all spells.
   * @param {number} rateMultiplier the multiplier to apply to a spell's cooldown rate.
   *     For example, an effect that "increases cooldown recovery rate by 15%" would
   *     require a rateMultiplier of 1.15.
   * @param {number} timestamp the timestamp on which the cooldown rate change was applied,
   *     if different from currentTimestamp.
   */
  public applyCooldownRateChange(
    spellId: number | number[] | 'ALL',
    rateMultiplier: number,
    timestamp: number = this.owner.currentTimestamp,
  ) {
    if (typeof spellId === 'string') {
      // ALL
      const oldRate = this._globalModRate;
      this._globalModRate = oldRate * rateMultiplier;

      Object.entries(this._currentCooldowns).forEach(([spellId, cdInfo]) => {
        this._handleChangeRate(Number(spellId), cdInfo, timestamp, rateMultiplier);
      });
    } else {
      const ids: number[] = typeof spellId === 'number' ? [spellId] : spellId;
      ids.forEach((id) => {
        const cdSpellId = this._getCanonicalId(id);
        const oldRate = this._spellModRates[cdSpellId] || 1;
        this._spellModRates[cdSpellId] = oldRate * rateMultiplier;

        const cdInfo = this._currentCooldowns[cdSpellId];
        if (cdInfo) {
          this._handleChangeRate(cdSpellId, cdInfo, timestamp, rateMultiplier);
        }
      });
    }

    DEBUG && console.log('Applied modRate to ' + spellId + ' of ' + rateMultiplier);
  }

  /**
   * {@link applyCooldownRateChange} with an inverted rateMultiplier.
   * Intended to make it easier to handle cooldown rate changes that are added and removed by a buff.
   */
  public removeCooldownRateChange(
    spellId: number | number[] | 'ALL',
    rateMultiplier: number,
    timestamp: number = this.owner.currentTimestamp,
  ) {
    this.applyCooldownRateChange(spellId, 1 / rateMultiplier, timestamp);
  }

  /////////////////////////////////////////////////////////////////////////////
  // EVENT HANDLERS -
  // Handle events to update cooldown info
  //

  /** On every event, we need to check if an existing tracked cooldown has expired */
  protected onEvent(event: AnyEvent) {
    const currentTimestamp = event.timestamp;

    Object.entries(this._currentCooldowns).forEach(([spellId, cdInfo]) => {
      if (cdInfo.expectedEnd <= currentTimestamp) {
        this.endCooldown(Number(spellId), cdInfo.expectedEnd, true);
      }
    });
  }

  /** On every cast, we need to start the spell's cooldown if it has one */
  protected onCast(event: CastEvent | FilterCooldownInfoEvent) {
    this.beginCooldown(event);
  }

  /** On every change in haste, we need to check each active cooldown to see if the
   *  remaining time needs to be adjusted (if the cooldown scales with haste) */
  protected onChangeHaste(event: ChangeHasteEvent) {
    DEBUG &&
      console.log(
        'Haste changed from ' +
          formatPercentage(event.oldHaste) +
          ' to ' +
          formatPercentage(event.newHaste) +
          ' @ ' +
          this.owner.formatTimestamp(event.timestamp, 1) +
          ' (t=' +
          event.timestamp +
          ')' +
          ' - updating cooldowns',
      );
    Object.entries(this._currentCooldowns).forEach(([spellId, cdInfo]) => {
      const orignalDuration = cdInfo.currentRechargeDuration;
      const newDuration = this._getExpectedCooldown(Number(spellId), true);
      if (orignalDuration !== newDuration) {
        // only need to adjust if CD changed
        const changeRate = orignalDuration / newDuration;
        this._handleChangeRate(Number(spellId), cdInfo, event.timestamp, changeRate);
      }
    });
  }

  /** Update cooldown info for changed number of max charges.
   *
   *  Note that unlike most event listeners, this is called from Abilities instead
   *  of using an event listener. This prevents the charge count in Abilities
   *  from becoming desynced from the charge count in SpellUsable.
   **/
  public onMaxChargesIncreased(event: MaxChargesIncreasedEvent) {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(event.spellId)];
    if (cdInfo) {
      cdInfo.maxCharges += event.by;
    }
  }

  /** Update cooldown info for changed number of max charges
   *
   *  Note that unlike most event listeners, this is called from Abilities instead
   *  of using an event listener. This prevents the charge count in Abilities
   *  from becoming desynced from the charge count in SpellUsable.
   **/
  public onMaxChargesDecreased(event: MaxChargesDecreasedEvent) {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(event.spellId)];
    if (cdInfo) {
      cdInfo.maxCharges -= event.by;
      if (cdInfo.maxCharges <= cdInfo.chargesAvailable) {
        this.endCooldown(event.spellId, event.timestamp);
      }
    }
  }

  /** On fight end, close out each cooldown at its expected end time */
  protected onFightEnd(event: FightEndEvent) {
    Object.entries(this._currentCooldowns).forEach(([spellId, cdInfo]) => {
      // does an end cooldown rather than restore charge ... FIXME will this matter?
      this.endCooldown(Number(spellId), cdInfo.expectedEnd, true, true);
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  // PRIVATE HELPERS -
  // Helper methods intended for internal use only
  //

  /**
   * Gets the canonical spell ID for an ability. For most abilities, this is just the spell ID.
   * Some abilities have multiple IDs associated with the same spell / cooldown -
   * this will return the first ability from the list of abilities sharing the cooldown.
   */
  private _getCanonicalId(spellId: number): number {
    const ability = this.abilities.getAbility(spellId);
    return ability ? ability.primarySpell : spellId;
  }

  /**
   * Gets a spell's current cooldown rate or 'modRate'.
   * @param canonicalSpellId the spell ID to check (MUST be the ability's primary ID)
   */
  private _getSpellModRate(canonicalSpellId: number): number {
    return this._globalModRate * (this._spellModRates[canonicalSpellId] || 1);
  }

  /**
   * Gets a spell's expected cooldown at the current time, including modRate.
   * @param canonicalSpellId the spell ID to check (MUST be the ability's primary ID)
   * @param forceCheckAbilites iff true, cooldown will be pulled from Abilities even if there
   *     is a cached value in cdInfo
   */
  private _getExpectedCooldown(
    canonicalSpellId: number,
    forceCheckAbilites: boolean = false,
  ): number {
    const cdInfo = this._currentCooldowns[canonicalSpellId];
    if (cdInfo && !forceCheckAbilites) {
      // cdInfo always kept up to date
      return cdInfo.currentRechargeDuration;
    } else {
      const unscaledCooldown = this.abilities.getExpectedCooldownDuration(canonicalSpellId);
      // always integer number of milliseconds
      return !unscaledCooldown
        ? 0
        : Math.round(unscaledCooldown / this._getSpellModRate(canonicalSpellId));
    }
  }

  /**
   * Updates cdInfo's expectedDuration and expectedEnd fields to account for a change in
   * the cooldown's rate. This calculation is the same for modRate and haste changes.
   * Calculations assume CD's expectedEnd is still after the timestamp.
   */
  private _handleChangeRate(
    spellId: number,
    cdInfo: CooldownInfo,
    timestamp: number,
    changeRate: number,
  ) {
    /*
     * All changes in cooldown recharge rate keep the cooldown's percentage progress.
     * (The below calculations could be done with one fewer line, but it's kept this way
     * to make the connection to percentage cooldown progress as clear as possible)
     *
     * For example, consider a spell that on cast has a cooldown of 8000ms.
     * at t=0, fullCD = 8000, expectedEnd = 8000
     * at t=2000, cooldown rate is doubled (changeRate = 2)
     *
     * First we calculate the time remaining on the cooldown (before rate change):
     * t=2000, expectedEnd=8000  =>  8000 - 2000 = 6000  =>  6000 time remaining
     *
     * Next we use that to calculate the percentage remaining on the cooldown (before rate change):
     * timeLeft=6000, rechargeDuration=8000  =>  6000 / 8000 = 0.75  =>  75% remaining
     *
     * Next we calculate the new cooldown after the rate change:
     * rechargeDuration=8000, changeRate=2  =>  8000 / 2 = 4000  =>  newRechargeDuration=4000
     *
     * Next we use the percent remaining and the new cooldown to get the new time remaining:
     * newRechargeDuration=4000, percentLeft=0.75  =>  4000 * 0.75 = 3000  =>  newTimeLeft=3000
     *
     * Finally we count up from the current timestamp to find the new expected end time:
     * t=2000, newTimeLeft=3000  =>  2000 + 3000 = 5000  =>  newExpectedEnd=5000
     */
    const timeRemaining = cdInfo.expectedEnd - timestamp;
    const percentageRemaining = timeRemaining / cdInfo.currentRechargeDuration;
    const newRechargeDuration = cdInfo.currentRechargeDuration / changeRate;
    const newTimeRemaining = Math.round(newRechargeDuration * percentageRemaining);
    const newExpectedEnd = timestamp + newTimeRemaining;

    DEBUG &&
      console.log(
        'Cooldown changed for active CD ' +
          spellName(spellId) +
          ' - old CD: ' +
          cdInfo.currentRechargeDuration +
          ' - new CD: ' +
          newRechargeDuration +
          ' / old expectedEnd: ' +
          this.owner.formatTimestamp(cdInfo.expectedEnd, 1) +
          ' (t=' +
          cdInfo.expectedEnd +
          ')' +
          ' - new expectedEnd: ' +
          this.owner.formatTimestamp(newExpectedEnd, 1) +
          ' (t=' +
          newExpectedEnd +
          ')',
      );

    cdInfo.currentRechargeDuration = newRechargeDuration;
    cdInfo.expectedEnd = newExpectedEnd;
  }

  /**
   * Resets a spell's cooldown so that the new cooldown begins at the given timestamp.
   * This does NOT increment the charge count or fabricate events,
   * the caller is responsible for that.
   * @param canonicalSpellId the spell's canonical ID
   * @param cdInfo the cooldown to reset
   * @param timestamp the timestamp to reset starting from
   * @param carryoverCdr any CDR to 'carry over' from the previous cooldown, in milliseconds.
   */
  private _resetCooldown(
    canonicalSpellId: number,
    cdInfo: CooldownInfo,
    timestamp: number,
    carryoverCdr: number = 0,
  ) {
    const expectedCooldownDuration = this._getExpectedCooldown(canonicalSpellId);
    if (!expectedCooldownDuration) {
      // shouldn't be possible to get here
      console.error(
        'Somehow tried to reset cooldown of ability that has a CooldownInfo, but no cooldown...',
        cdInfo,
      );
      return;
    }
    cdInfo.currentRechargeDuration = expectedCooldownDuration;
    cdInfo.expectedEnd = timestamp + expectedCooldownDuration - carryoverCdr;
  }

  public static generateUpdateSpellUsableEvent(
    canonicalSpellId: number,
    timestamp: number,
    info: CooldownInfo,
    updateType: UpdateSpellUsableType,
    combatantId: number,
  ): UpdateSpellUsableEvent {
    const spell = maybeGetTalentOrSpell(canonicalSpellId);

    const event: UpdateSpellUsableEvent = {
      type: EventType.UpdateSpellUsable,
      timestamp,
      ability: {
        guid: canonicalSpellId,
        name: spell?.name ?? '',
        abilityIcon: spell?.icon ?? '',
      },
      updateType,
      isOnCooldown: info.maxCharges > info.chargesAvailable,
      isAvailable: info.chargesAvailable > 0,
      chargesAvailable: info.chargesAvailable,
      maxCharges: info.maxCharges,
      chargeStartTimestamp: info.chargeStart,
      overallStartTimestamp: info.overallStart,
      expectedRechargeTimestamp: info.expectedEnd,
      expectedRechargeDuration: info.currentRechargeDuration,
      // timeWaitingOnGCD filled in by another modules

      sourceID: combatantId,
      sourceIsFriendly: true,
      targetID: combatantId,
      targetIsFriendly: true,

      __fabricated: true,
    };

    return event;
  }

  /**
   * Fabricates an UpdateSpellUsableEvent and inserts it into the events stream.
   * @param {UpdateSpellUsableType} updateType the type of update this is
   * @param {number} canonicalSpellId the spell's canonical ID
   * @param {number} timestamp the timestamp of the update
   * @param {CooldownInfo} info the cooldown info object pertaining to this spell
   *     (after the appropriate updates have been calculated)
   */
  private _fabricateUpdateSpellUsableEvent(
    updateType: UpdateSpellUsableType,
    canonicalSpellId: number,
    timestamp: number,
    info: CooldownInfo,
  ) {
    const event = SpellUsable.generateUpdateSpellUsableEvent(
      canonicalSpellId,
      timestamp,
      info,
      updateType,
      this.selectedCombatant.id,
    );

    if (DEBUG) {
      let logLine =
        updateType +
        ' on ' +
        spellName(canonicalSpellId) +
        ' @ ' +
        this.owner.formatTimestamp(timestamp, 1) +
        ' (t=' +
        timestamp +
        ')';
      if (
        updateType === UpdateSpellUsableType.RestoreCharge ||
        updateType === UpdateSpellUsableType.UseCharge
      ) {
        logLine += ' (' + info.chargesAvailable + ' of ' + info.maxCharges + ' charges remaining)';
      }
      if (updateType === UpdateSpellUsableType.BeginCooldown) {
        logLine += ' (current recharge duration: ' + info.currentRechargeDuration + 'ms)';
      }
      console.log(logLine);
    }

    this.eventEmitter.fabricateEvent(event);
  }

  private recordCooldownDebugInfo(
    event: AnyEvent,
    spellId: number,
    info: CooldownInfo | undefined,
  ): void {
    if (CASTS_THAT_ARENT_CASTS.includes(spellId) && !DEBUG_WHITELIST.includes(spellId)) {
      return; // don't record any info for this
    }
    const ability = this.abilities.getAbility(spellId);
    let annotation: Annotation;
    if (
      info &&
      info.chargesAvailable === 0 &&
      info.expectedEnd - event.timestamp > COOLDOWN_LAG_MARGIN
    ) {
      annotation = {
        color: BadColor,
        summary: `${spellName(spellId)} (ID=${spellId}) was used while SpellUsable's tracker thought it had no available charges (expected end @ ${this.owner.formatTimestamp(info.expectedEnd)})`,
        // note: we are making a copy of `info` so that later display is not muddled by mutation
        details: (
          <SpellUsableDebugDescription cdInfo={{ ...info }} event={event} parser={this.owner} />
        ),
      };
    } else if (!ability && HasAbility(event)) {
      annotation = {
        color: OkColor,
        summary: `Ability ${event.ability.name} (ID: ${event.ability.guid}) was used but is not in spellbook or listed as a cast that isn't a cast`,
      };
      console.warn(
        'Ability is missing from spellbook (check out spellUsable in the debug annotation view for more info):',
        event.ability,
      );
    } else {
      annotation = {
        color: GoodColor,
        summary: 'No cooldown issues found.',
        priority: -Infinity,
      };
    }
    this.addDebugAnnotation(event, annotation);
  }
}

export default SpellUsable;
