import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  AbilityEvent,
  AnyEvent,
  CastEvent,
  ChangeHasteEvent,
  EventType,
  FightEndEvent,
  MaxChargesDecreased,
  MaxChargesIncreased,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import EventEmitter from 'parser/core/modules/EventEmitter';

const DEBUG = true;

/** Margin in milliseconds beyond which we log errors if numbers don't line up */
export const COOLDOWN_LAG_MARGIN = 150;

function spellName(spellId: number) {
  return SPELLS[spellId] ? SPELLS[spellId].name : '???';
}

/**
 * Info about a spell that is currently cooling down.
 * When a spell finishes coolding down, the CooldownInfo about it is deleted.
 * Spells without charges are considered to effectively have one charge.
 */
type CooldownInfo = {
  /** Timestamp this cooldown started overall (not the most recent charge) */
  overallStart: number;
  /** The expected duration of the cooldown based on current conditions */
  expectedDuration: number;
  /** The expected end time of the cooldown based on current conditions */
  expectedEnd: number;
  /** The number of spell charges currently available
   * (for spells without charges this will always be zero) */
  chargesAvailable: number;
  /** The maximum number of charges this spell can have.
   * (for spells without charges this will always be one) */
  maxCharges: number;
};

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
  _currentCooldowns: { [spellId: number]: CooldownInfo } = {};
  /** A global multiplier for the cooldown rate, also known as the 'modRate' */
  _globalModRate: number = 1;
  /** Per-spell multipliers for the cooldown rate, also knowns as the 'modRate' */
  _spellModRates: { [spellId: number]: number } = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(Events.any, this.onEvent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.ChangeHaste, this.onChangeHaste);
    this.addEventListener(Events.fightend, this.onFightEnd);
    this.addEventListener(Events.MaxChargesIncreased, this.onMaxChargesIncreased);
    this.addEventListener(Events.MaxChargesDescreased, this.onMaxChargesDecreased);
    // TODO handle prefilter
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC QUERIES -
  // Methods other analyzers can use to query the state of a cooldown
  //

  /**
   * Whether the spell can be cast. This is not the opposite of `isOnCooldown`!
   * A spell with 2 charges, 1 available and 1 on cooldown would be both
   * available and on cooldown at the same time.
   * @param spellId the spell's ID
   */
  isAvailable(spellId: number): boolean {
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
  isOnCooldown(spellId: number): boolean {
    // a cooldown info exists iff the spell is on cooldown
    return Boolean(this._currentCooldowns[this._getCanonicalId(spellId)]);
  }

  /**
   * The number of charges of the spell currently available.
   * For an available spell without charges, this will always be one.
   * @param spellId the spell's ID
   */
  chargesAvailable(spellId: number): number {
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
  chargesOnCooldown(spellId: number): number {
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
  fullCooldownDuration(spellId: number): number {
    return this._getExpectedCooldown(this._getCanonicalId(spellId));
  }

  /**
   * The expected amount of time remaining on the spell's cooldown (for its current charge).
   * For spells that aren't on cooldown, this will always return zero.
   * @param spellId the spell's ID
   * @param timestamp the timestamp to check from (if different from current timestamp)
   * @return time remaining on the cooldown, in milliseconds
   */
  cooldownRemaining(spellId: number, timestamp: number = this.owner.currentTimestamp): number {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(spellId)];
    return !cdInfo ? 0 : cdInfo.expectedEnd - timestamp;
  }

  /////////////////////////////////////////////////////////////////////////////
  // PUBLIC COOLDOWN MANIPULATION -
  // Methods other analyzers can use to change cooldown state in order to implement effects
  //

  /**
   * Begins the spell's cooldown (as though the spell was just cast).
   * This is called automatically when the spell is cast, but analyzers can override or manually
   * call this in order to handle special cases.
   * @param {AbilityEvent<any>} triggeringEvent the event that triggered the cooldown
   *     (typically a CastEvent)
   * @param spellId the spell's ID, if it is different from the triggeringEvent's ID.
   */
  beginCooldown(
    triggeringEvent: AbilityEvent<any>,
    spellId: number = triggeringEvent.ability.guid,
  ) {
    const cdSpellId = this._getCanonicalId(spellId);
    const cdInfo = this._currentCooldowns[cdSpellId];
    if (!cdInfo) {
      // spell isn't currently on cooldown - start a new cooldown!
      const ability = this.abilities.getAbility(cdSpellId);
      if (!ability) {
        return; // no registered ability for this - assume no cooldown
      }

      const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(ability);
      if (!expectedCooldownDuration) {
        return; // this ability doesn't have a cooldown
      }
      const maxCharges = this.abilities.getMaxCharges(ability) || 1;

      const newInfo: CooldownInfo = {
        overallStart: triggeringEvent.timestamp,
        expectedEnd: triggeringEvent.timestamp + expectedCooldownDuration,
        expectedDuration: expectedCooldownDuration,
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
      // Spell shouldn't be available right now... if outside of the lag margin, log an error.
      // In any event, the spell clearly *is* available, so we'll create a simultaneous
      const remainingCooldown = cdInfo.expectedEnd - triggeringEvent.timestamp;
      if (remainingCooldown > COOLDOWN_LAG_MARGIN) {
        console.warn(
          'Cooldown error - ' +
            spellName(cdSpellId) +
            ' ID=' +
            cdSpellId +
            " was used while SpellUsable's tracker thought it had no available charges. " +
            'This could happen due to missing haste buffs, missing CDR, missing reductions/resets, ' +
            'or incorrect ability config.\n' +
            'Expected time left on CD: ' +
            remainingCooldown +
            '\n' +
            'Current Time: ' +
            triggeringEvent.timestamp +
            '\n' +
            'CooldownInfo object before update: ' +
            cdInfo +
            '\n',
        );
      }

      // trigger an end cooldown and then immediately a begin cooldown
      this.endCooldown(cdSpellId, triggeringEvent.timestamp);
      this.beginCooldown(triggeringEvent, spellId);
    }
  }

  /**
   * End the spell's cooldown (or for a spell with charges, restores one charge).
   * This is automaticall called by this module when a spell's cooldown ends naturally,
   * this function should only be called to handle 'reset cooldown' or 'restore charge' effects.
   *
   * @param {number} spellId the spell's ID.
   * @param {number} timestamp the timestamp on which the cooldown ended,
   *     if different from currentTimestamp.
   * @param {boolean} resetCooldown if the cooldown's progress should be reset.
   *     This field is only relevant for spells with more than one charge.
   *     iff true, a charge will be added and cooldown progress will be set back to zero.
   *     iff false, a charge will be added and cooldown progress will be retained.
   *     Most 'restore charge' effects do not reset the cooldown, hence the default to false.
   * @param {boolean} restoreAllCharges if all charges should be restored rather than just one.
   *     This field is only relevant for spells with more than one charge.
   *     Most 'restore charge' effects restore only one charge, hence the default to false.
   */
  endCooldown(
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
    }
  }

  /**
   * Reduces the time left on a cooldown by the given amount.
   * TODO explain behavior with haste and modRate
   * @param {number} spellId The ID of the spell.
   * @param {number} reductionMs The duration to reduce the cooldown by, in milliseconds.
   * @param {number} timestamp the timestamp on which the cooldown was reduced,
   *     if different from currentTimestamp.
   * @return {number} the effective cooldown reduction, in milliseconds TODO explain better?
   */
  reduceCooldown(
    spellId: number,
    reductionMs: number,
    timestamp: number = this.owner.currentTimestamp,
  ): number {
    // get cooldown info
    const cdSpellId = this._getCanonicalId(spellId);
    const cdInfo = this._currentCooldowns[cdSpellId];
    if (!cdInfo) {
      // Nothing to reduce, the spell isn't on cooldown
      console.info(
        'Tried to reduce cooldown of ' + spellName(spellId) + ", but it wasn't on cooldown",
      );
    }

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
      let effectiveReductionMs = reductionMs;
      if (cdInfo.maxCharges - cdInfo.chargesAvailable === 1) {
        // this reduction will end the cooldown, so some of it will be wasted
        const scaledEffectiveReduction = scaledReductionMs - carryoverCdr;
        effectiveReductionMs = scaledEffectiveReduction * modRate;
      }

      this._resetCooldown(cdSpellId, cdInfo, timestamp, carryoverCdr);
      this.endCooldown(spellId, timestamp); // we reset CD here, so don't want end cooldown to do it too

      return effectiveReductionMs;
    } else {
      return reductionMs;
    }
  }

  /**
   * Change the rate at which a spell's cooldown recovers. By default,
   * cooldowns recover at a rate of 1, e.g. "one second per second".
   * Effects that increase (or decrease) the ability cooldown rate
   * (sometimes referred to as "modRate") can modify this.
   * @param {number | 'ALL'} spellId The ID of the spell to change, or 'ALL' if you want
   *     to change the cooldown rate of all spells.
   * @param {number} rateMultiplier the multiplier to apply to a spell's cooldown rate.
   *     For example, an effect that "increases cooldown recovery rate by 15%" would
   *     require a rateMultiplier of 1.15.
   * @param {number} timestamp the timestamp on which the cooldown rate change was applied,
   *     if different from currentTimestamp.
   */
  applyCooldownRateChange(
    spellId: number | 'ALL',
    rateMultiplier: number,
    timestamp: number = this.owner.currentTimestamp,
  ) {
    if (typeof spellId === 'number') {
      const cdSpellId = this._getCanonicalId(spellId);
      const oldRate = this._spellModRates[cdSpellId] || 1;
      const newRate = oldRate * rateMultiplier;
      const changeRate = newRate / oldRate;
      this._spellModRates[cdSpellId] = newRate;

      const cdInfo = this._currentCooldowns[cdSpellId];
      if (cdInfo) {
        this._handleChangeRate(cdInfo, timestamp, changeRate);
      }
    } else {
      // ALL
      const oldRate = this._globalModRate;
      const newRate = oldRate * rateMultiplier;
      const changeRate = newRate / oldRate;
      this._globalModRate = newRate;

      Object.values(this._currentCooldowns).forEach((cdInfo) => {
        this._handleChangeRate(cdInfo, timestamp, changeRate);
      });
    }
  }

  /**
   * {@link applyCooldownRateChange} with an inverted rateMultiplier.
   * Intended to make it easier to handle cooldown rate changes that are added and removed by a buff.
   */
  removeCooldownRateChange(
    spellId: number | 'ALL',
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
  onEvent(event: AnyEvent) {
    // TODO handle FilterCooldownInfo?
    const currentTimestamp = event.timestamp;

    Object.entries(this._currentCooldowns).forEach(([spellId, cdInfo]) => {
      if (cdInfo.expectedEnd <= currentTimestamp) {
        this.endCooldown(Number(spellId), currentTimestamp, true);
      }
    });
  }

  /** On every cast, we need to start the spell's cooldown if it has one */
  onCast(event: CastEvent) {
    this.beginCooldown(event);
  }

  /** On every change in haste, we need to check each active cooldown to see if the
   *  remaining time needs to be adjusted (if the cooldown scales with haste) */
  onChangeHaste(event: ChangeHasteEvent) {
    Object.entries(this._currentCooldowns).forEach(([spellId, cdInfo]) => {
      const orignalDuration = cdInfo.expectedDuration;
      const newDuration = this._getExpectedCooldown(Number(spellId));
      if (orignalDuration !== newDuration) {
        // no adjustment required if CD didn't change
        const changeRate = orignalDuration / newDuration;
        this._handleChangeRate(cdInfo, event.timestamp, changeRate);
      }
    });
  }

  /** Update cooldown info for changed number of max charges */
  onMaxChargesIncreased(event: MaxChargesIncreased) {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(event.spellId)];
    if (cdInfo) {
      cdInfo.maxCharges += event.by;
    }
  }

  /** Update cooldown info for changed number of max charges */
  onMaxChargesDecreased(event: MaxChargesDecreased) {
    const cdInfo = this._currentCooldowns[this._getCanonicalId(event.spellId)];
    if (cdInfo) {
      cdInfo.maxCharges -= event.by;
      if (cdInfo.maxCharges <= cdInfo.chargesAvailable) {
        this.endCooldown(event.spellId, event.timestamp);
      }
    }
  }

  /** On fight end, close out each cooldown at its expected end time TODO who actually needs this? */
  onFightEnd(event: FightEndEvent) {
    Object.entries(this._currentCooldowns).forEach(([spellId, cdInfo]) => {
      // TODO this only restores on charge for each, do I need to repeat until all charges gone?
      this.endCooldown(Number(spellId), cdInfo.expectedEnd, true, false);
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
  _getCanonicalId(spellId: number): number {
    const ability = this.abilities.getAbility(spellId);
    return ability ? ability.primarySpell : spellId;
  }

  /**
   * Gets a spell's current cooldown rate or 'modRate'.
   */
  _getSpellModRate(canonicalSpellId: number): number {
    return this._globalModRate * (this._spellModRates[canonicalSpellId] || 1);
  }

  /**
   * Gets a spell's expected cooldown at the current time, including modRate.
   *  If info cannot be found or if spell doesn't have a cooldown, zero will be returned.
   */
  _getExpectedCooldown(canonicalSpellId: number): number {
    const cdInfo = this._currentCooldowns[canonicalSpellId];
    if (cdInfo) {
      // cdInfo always kept up to date
      return cdInfo.expectedDuration;
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
   */
  _handleChangeRate(cdInfo: CooldownInfo, timestamp: number, changeRate: number) {
    // assumes expectedEnd is still after timestamp!
    const timeLeft = cdInfo.expectedEnd - timestamp;
    const percentageLeft = timeLeft / cdInfo.expectedDuration;
    const newExpectedDuration = cdInfo.expectedDuration * changeRate;
    const newTimeLeft = newExpectedDuration * percentageLeft;

    cdInfo.expectedDuration = newExpectedDuration;
    cdInfo.expectedEnd = timestamp + newTimeLeft;
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
  _resetCooldown(
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
    cdInfo.expectedDuration = expectedCooldownDuration;
    cdInfo.expectedEnd = timestamp + expectedCooldownDuration - carryoverCdr;
  }

  /**
   * Fabricates an UpdateSpellUsableEvent and inserts it into the events stream
   * @param {UpdateSpellUsableType} updateType the type of update this is
   * @param {number} spellId the ID of the fabricated event
   * @param {number} timestamp the timestamp of the fabricated event
   * @param {CooldownInfo} info the cooldown info object pertaining to this spell
   *     (after the appropriate updates have been calculated)
   */
  _fabricateUpdateSpellUsableEvent(
    updateType: UpdateSpellUsableType,
    spellId: number,
    timestamp: number,
    info: CooldownInfo,
  ) {
    const spell = SPELLS[spellId];

    const event: UpdateSpellUsableEvent = {
      type: EventType.UpdateSpellUsable,
      timestamp,
      ability: {
        guid: spellId,
        name: spell ? spell.name : undefined,
        abilityIcon: spell ? spell.icon : undefined,
      },
      updateType,
      isOnCooldown: info.maxCharges > info.chargesAvailable,
      isAvailable: info.chargesAvailable > 0,
      chargesAvailable: info.chargesAvailable,
      maxCharges: info.maxCharges,
      overallStartTimestamp: info.overallStart,
      expectedRechargeTimestamp: info.expectedEnd,
      expectedRechargeDuration: info.expectedDuration,
      // timeWaitingOnGCD filled in by another modules

      sourceID: this.owner.selectedCombatant.id,
      sourceIsFriendly: true,
      targetID: this.owner.selectedCombatant.id,
      targetIsFriendly: true,

      __fabricated: true,
    };

    DEBUG && console.log(updateType + ' on ' + spellName(spellId));

    this.eventEmitter.fabricateEvent(event);
  }
}

export default SpellUsable;

// import { formatPercentage } from 'common/format';
// import SPELLS from 'common/SPELLS';
// import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
// import Events, {
//   AnyEvent,
//   CastEvent,
//   ChangeHasteEvent,
//   EventType,
//   FilterCooldownInfoEvent,
//   MaxChargesDecreased,
//   UpdateSpellUsableEvent, UpdateSpellUsableType,
// } from 'parser/core/Events';
// import EventEmitter from 'parser/core/modules/EventEmitter';
//
// import Abilities from '../../core/modules/Abilities';
//
// const debug = false;
// export const INVALID_COOLDOWN_CONFIG_LAG_MARGIN = 150; // not sure what this is based around, but <150 seems to catch most false positives
// let fullExplanation = true;
//
// function spellName(spellId: number) {
//   return SPELLS[spellId] ? SPELLS[spellId].name : '???';
// }
//
// type CooldownInfo = {
//   start: number;
//   chargesOnCooldown: number;
//   expectedDuration: number;
//   totalReductionTime: number;
//   cooldownTriggerEvent: AnyEvent;
// };
//
// /**
//  * Comprehensive tracker for spell cooldown status
//  */
// class SpellUsable extends Analyzer {
//   static dependencies = {
//     eventEmitter: EventEmitter,
//     abilities: Abilities,
//   };
//   protected eventEmitter!: EventEmitter;
//   protected abilities!: Abilities;
//
//   _currentCooldowns: { [spellId: number]: CooldownInfo } = {};
//
//   constructor(options: Options) {
//     super(options);
//     this.addEventListener(Events.any, this.onEvent);
//     this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
//     this.addEventListener(Events.prefiltercd.by(SELECTED_PLAYER), this.onCast);
//     this.addEventListener(Events.ChangeHaste, this.onChangehaste);
//     this.addEventListener(Events.fightend, this.onFightend);
//     this.addEventListener(Events.MaxChargesDescreased, this.onMaxChargesDecreased);
//   }
//
//   /**
//    * Find the canonical spell id of an ability. For most abilities, this
//    * is just the spell ID. For abilities with shared CDs / charges, this is
//    * the first ability in the list of abilities that share with it.
//    */
//   _getCanonicalId(spellId: number): number {
//     const ability = this.abilities.getAbility(spellId);
//     if (!ability) {
//       return spellId; // not a class ability
//     }
//     return ability.primarySpell;
//   }
//
//   /**
//    * Whether the spell can be cast. This is not the opposite of `isOnCooldown`!
//    * A spell with 2 charges, 1 available and 1 on cooldown would be both
//    * available and on cooldown at the same time.
//    * @param spellId the spell's ID
//    */
//   isAvailable(spellId: number): boolean {
//     const canSpellId = this._getCanonicalId(spellId);
//     if (!this.isOnCooldown(canSpellId)) {
//       return true;
//     }
//     const maxCharges = this.abilities.getMaxCharges(canSpellId) || 1;
//     if (maxCharges > this._currentCooldowns[canSpellId].chargesOnCooldown) {
//       return true;
//     }
//     return false;
//   }
//
//   /**
//    * The number of charges of the spell currently available.
//    * For an available spell without charges, this will always be one.
//    * @param spellId the spell's ID
//    * @returns The number of charges available for the given spell
//    */
//   chargesAvailable(spellId: number) {
//     const canSpellId = this._getCanonicalId(spellId);
//     const maxCharges = this.abilities.getMaxCharges(canSpellId) || 1;
//     if (this.isOnCooldown(canSpellId)) {
//       return maxCharges - this._currentCooldowns[canSpellId].chargesOnCooldown;
//     } else {
//       return maxCharges;
//     }
//   }
//
//   /**
//    * Whether the spell is cooling down. This is not the opposite of `isAvailable`!
//    * A spell with 2 charges, 1 available and 1 on cooldown would be both
//    * available and on cooldown at the same time.
//    * @param spellId the spell's ID
//    */
//   isOnCooldown(spellId: number) {
//     const canSpellId = this._getCanonicalId(spellId);
//     return Boolean(this._currentCooldowns[canSpellId]);
//   }
//
//   /**
//    * TODO update
//    * Returns the amount of time remaining on the cooldown.
//    * @param {number} spellId
//    * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
//    * @returns {number}
//    */
//   cooldownRemaining(spellId: number, timestamp: number = this.owner.currentTimestamp): number {
//     const canSpellId = this._getCanonicalId(spellId);
//     if (!this.isOnCooldown(canSpellId)) {
//       return 0;
//     }
//     const cooldown = this._currentCooldowns[canSpellId];
//     const expectedEnd = Math.round(
//       cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime,
//     );
//     return expectedEnd - timestamp;
//   }
//
//   // TODO update
//   cooldownTriggerEvent(spellId: number) {
//     const canSpellId = this._getCanonicalId(spellId);
//     if (!this.isOnCooldown(canSpellId)) {
//       throw new Error(
//         `Tried to retrieve the remaining cooldown of ${canSpellId}, but it's not on cooldown.`,
//       );
//     }
//     const cooldown = this._currentCooldowns[canSpellId];
//     return cooldown.cooldownTriggerEvent;
//   }
//
//   /**
//    * Start the cooldown for the provided spell.
//    * @param {number} spellId The ID of the spell.
//    * @param {object} cooldownTriggerEvent Which event triggered the cooldown. This MUST include a timestamp. This is used by potions to determine if it was a prepull cast, but may be used for other things too.
//    */
//   beginCooldown(spellId: number, cooldownTriggerEvent: AnyEvent) {
//     if (process.env.NODE_ENV === 'development') {
//       if (cooldownTriggerEvent.timestamp === undefined) {
//         throw new Error('cooldownTriggerEvent must at least have a timestamp property.');
//       }
//     }
//
//     const canSpellId = this._getCanonicalId(spellId);
//     const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(
//       canSpellId,
//       cooldownTriggerEvent,
//     );
//     if (!expectedCooldownDuration) {
//       debug && this.warn('Spell', spellName(canSpellId), canSpellId, "doesn't have a cooldown.");
//       return;
//     }
//
//     if (!this.isOnCooldown(canSpellId)) {
//       this._currentCooldowns[canSpellId] = {
//         start: cooldownTriggerEvent.timestamp,
//         cooldownTriggerEvent,
//         expectedDuration: expectedCooldownDuration,
//         totalReductionTime: 0,
//         chargesOnCooldown: 1,
//       };
//       this._triggerEvent(
//         this._makeEvent(canSpellId, cooldownTriggerEvent.timestamp, UpdateSpellUsableType.BeginCooldown),
//       );
//     } else {
//       if (this.isAvailable(canSpellId)) {
//         // Another charge is available
//         this._currentCooldowns[canSpellId].chargesOnCooldown += 1;
//         this._triggerEvent(
//           this._makeEvent(canSpellId, cooldownTriggerEvent.timestamp, UpdateSpellUsableType.UseCharge),
//         );
//       } else {
//         const remainingCooldown = this.cooldownRemaining(
//           canSpellId,
//           cooldownTriggerEvent.timestamp,
//         );
//         if (remainingCooldown > INVALID_COOLDOWN_CONFIG_LAG_MARGIN) {
//           // No need to report if it was expected to reset within the set margin, as latency can cause this fluctuation.
//           // Only mention reduction times if applicable (this is pretty rare)
//           const reductionInfo =
//             this._currentCooldowns[canSpellId].totalReductionTime > 0
//               ? [
//                   'totalReductionTime:',
//                   this._currentCooldowns[canSpellId].totalReductionTime,
//                   'adjusted expected duration:',
//                   this._currentCooldowns[canSpellId].expectedDuration -
//                     this._currentCooldowns[canSpellId].totalReductionTime,
//                 ]
//               : [];
//           if (fullExplanation) {
//             this.error(
//               "A cooldown error has occurred. The most likely cause is missing a Haste buff, but the cooldown might also have multiple charges, can be reset early, cooldown can be reduced, the configured CD is invalid, the combatlog records multiple casts per player cast (e.g. ticks of a channel) or this is a latency issue. There's already handling for latency, but if it's extremely high, there might still be false positives. But usually it's a Haste issue.",
//             );
//           }
//           this.error(
//             spellName(canSpellId),
//             canSpellId,
//             'was cast while already marked as on cooldown.',
//             'time passed:',
//             cooldownTriggerEvent.timestamp - this._currentCooldowns[canSpellId].start,
//             'cooldown remaining:',
//             remainingCooldown,
//             'expectedDuration:',
//             this._currentCooldowns[canSpellId].expectedDuration,
//             ...reductionInfo,
//           );
//           fullExplanation = false;
//         }
//         this.endCooldown(canSpellId, false, cooldownTriggerEvent.timestamp);
//         this.beginCooldown(canSpellId, cooldownTriggerEvent);
//       }
//     }
//   }
//
//   /**
//    * Finishes the cooldown for the provided spell.
//    * @param {number} spellId The ID of the spell.
//    * @param {boolean} resetAllCharges Whether all charges should be reset or just the last stack. Does nothing for spells with just 1 stack.
//    * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
//    * @param {number} remainingCDR For abilities with charges, the remaining cooldown reduction if the reduction is more than the remaining cooldown of the charge and more than 1 charge is on cooldown
//    * @returns {*}
//    */
//   endCooldown(
//     spellId: number,
//     resetAllCharges = false,
//     timestamp = this.owner.currentTimestamp,
//     remainingCDR = 0,
//   ): number {
//     const canSpellId = this._getCanonicalId(spellId);
//     if (!this.isOnCooldown(canSpellId)) {
//       // We want implementers to check this themselves so they *have* to think about how to handle it properly in whatever module they're working on.
//       throw new Error(`Tried to end the cooldown of ${canSpellId}, but it's not on cooldown.`);
//     }
//
//     const cooldown = this._currentCooldowns[canSpellId];
//     if (cooldown.chargesOnCooldown === 1 || resetAllCharges) {
//       delete this._currentCooldowns[canSpellId];
//       this._triggerEvent(
//         this._makeEvent(canSpellId, timestamp, UpdateSpellUsableType.EndCooldown, {
//           ...cooldown,
//           end: timestamp,
//         }),
//       );
//       return 0;
//     } else {
//       // We have another charge ready to go on cooldown, this simply adds a charge and then refreshes the cooldown (spells with charges don't cooldown simultaneously)
//       cooldown.chargesOnCooldown -= 1;
//       this._triggerEvent(this._makeEvent(canSpellId, timestamp, UpdateSpellUsableType.RestoreCharge, cooldown));
//       this.refreshCooldown(canSpellId, {
//         timestamp,
//       });
//       if (remainingCDR !== 0) {
//         return this.reduceCooldown(canSpellId, remainingCDR, timestamp);
//       }
//     }
//     return 0;
//   }
//
//   /**
//    * TODO remove?
//    * Refresh (restart) the cooldown for the provided spell.
//    * @param {number} spellId The ID of the spell.
//    * @param {object} cooldownTriggerEvent Which event triggered the cooldown. This MUST include a timestamp. This is used by potions to determine if it was a prepull cast, but may be used for other things too.
//    */
//   refreshCooldown(spellId: number, cooldownTriggerEvent: { timestamp: number }) {
//     const canSpellId = this._getCanonicalId(spellId);
//     if (!this.isOnCooldown(canSpellId)) {
//       throw new Error(`Tried to refresh the cooldown of ${canSpellId}, but it's not on cooldown.`);
//     }
//     const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(canSpellId);
//     if (!expectedCooldownDuration) {
//       debug && this.warn('Spell', spellName(canSpellId), canSpellId, "doesn't have a cooldown.");
//       return;
//     }
//
//     this._currentCooldowns[canSpellId].start = cooldownTriggerEvent.timestamp;
//     this._currentCooldowns[canSpellId].expectedDuration = expectedCooldownDuration;
//     this._currentCooldowns[canSpellId].totalReductionTime = 0;
//     // this._triggerEvent(
//     //   this._makeEvent(canSpellId, cooldownTriggerEvent.timestamp, EventType.RefreshCooldown),
//     // );
//   }
//
//   /**
//    * Reduces the cooldown for the provided spell by the provided duration.
//    * @param {number} spellId The ID of the spell.
//    * @param {number} reductionMs The duration to reduce the cooldown with, in milliseconds.
//    * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
//    * @returns {number}
//    */
//   reduceCooldown(spellId: number, reductionMs: number, timestamp = this.owner.currentTimestamp) {
//     const canSpellId = this._getCanonicalId(spellId);
//     if (!this.isOnCooldown(canSpellId)) {
//       throw new Error(`Tried to reduce the cooldown of ${canSpellId}, but it's not on cooldown.`);
//     }
//     const cooldownRemaining = this.cooldownRemaining(canSpellId, timestamp);
//     if (cooldownRemaining < reductionMs) {
//       const remainingCDR = reductionMs - cooldownRemaining;
//       return cooldownRemaining + this.endCooldown(canSpellId, false, timestamp, remainingCDR);
//     } else {
//       this._currentCooldowns[canSpellId].totalReductionTime += reductionMs;
//       debug &&
//         this.log(
//           'Reduced',
//           spellName(canSpellId),
//           canSpellId,
//           'by',
//           reductionMs,
//           'remaining:',
//           this.cooldownRemaining(canSpellId, timestamp),
//           'old:',
//           cooldownRemaining,
//           'new expected duration:',
//           this._currentCooldowns[canSpellId].expectedDuration -
//             this._currentCooldowns[canSpellId].totalReductionTime,
//           'total CDR:',
//           this._currentCooldowns[canSpellId].totalReductionTime,
//         );
//       return reductionMs;
//     }
//   }
//
//   /**
//    * Extends the cooldown for the provided spell by the provided duration.
//    * @param {any} spellId The ID of the spell.
//    * @param {number} extensionMS The duration to extend the cooldown with, in milliseconds.
//    * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
//    * @returns {*}
//    */
//   extendCooldown(spellId: number, extensionMS: number, timestamp = this.owner.currentTimestamp) {
//     const canSpellId = this._getCanonicalId(spellId);
//     if (!this.isOnCooldown(canSpellId)) {
//       throw new Error(`Tried to extend the cooldown of ${canSpellId}, but it's not on cooldown.`);
//     }
//     const cooldownRemaining = this.cooldownRemaining(canSpellId, timestamp);
//     this._currentCooldowns[canSpellId].totalReductionTime -= extensionMS;
//     debug &&
//       this.log(
//         'Extended',
//         spellName(canSpellId),
//         canSpellId,
//         'by',
//         extensionMS,
//         'remaining:',
//         this.cooldownRemaining(canSpellId, timestamp),
//         'old:',
//         cooldownRemaining,
//         'new expected duration:',
//         this._currentCooldowns[canSpellId].expectedDuration -
//           this._currentCooldowns[canSpellId].totalReductionTime,
//         'total extension:',
//         -this._currentCooldowns[canSpellId].totalReductionTime,
//       );
//     return extensionMS;
//   }
//
//   _makeEvent(
//     spellId: number,
//     timestamp: number,
//     updateType: UpdateSpellUsableType,
//     others = {},
//   ): UpdateSpellUsableEvent {
//     const cooldown = this._currentCooldowns[spellId];
//     const chargesOnCooldown = cooldown ? cooldown.chargesOnCooldown : 0;
//     const maxCharges = this.abilities.getMaxCharges(spellId) || 1;
//     const spell = SPELLS[spellId];
//
//     return {
//       type: EventType.UpdateSpellUsable,
//       ability: {
//         guid: spellId,
//         name: spell ? spell.name : undefined,
//         abilityIcon: spell ? spell.icon : undefined,
//       },
//       updateType,
//       timestamp,
//       isOnCooldown: this.isOnCooldown(spellId),
//       isAvailable: this.isAvailable(spellId),
//       chargesAvailable: maxCharges - chargesOnCooldown,
//       maxCharges,
//       // __fabricated is technically added in eventemitter, but it makes typing much simpler to add it here
//       __fabricated: true,
//       ...cooldown,
//       ...others,
//     };
//   }
//
//   _triggerEvent(event: UpdateSpellUsableEvent) {
//     if (debug) {
//       const spellId = event.ability.guid;
//       switch (event.updateType) {
//         case 'BeginCooldown':
//           this.log(
//             'Cooldown started:',
//             spellName(spellId),
//             spellId,
//             'expected duration:',
//             event.expectedDuration,
//             `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`,
//           );
//           break;
//         case 'UseCharge':
//           this.log(
//             'Used another charge:',
//             spellName(spellId),
//             spellId,
//             `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`,
//           );
//           break;
//         case 'RestoreCharge':
//           this.log(
//             'Charge restored:',
//             spellName(spellId),
//             spellId,
//             `(charges left on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`,
//           );
//           break;
//         case 'EndCooldown':
//           this.log('Cooldown finished:', spellName(spellId), spellId);
//           break;
//         default:
//           break;
//       }
//     }
//
//     this.eventEmitter.fabricateEvent(event);
//   }
//
//   onCast(event: CastEvent | FilterCooldownInfoEvent) {
//     const spellId = event.ability.guid;
//     this.beginCooldown(spellId, event);
//   }
//
//   _checkCooldownExpiry(timestamp: number) {
//     Object.entries(this._currentCooldowns).forEach(([spellId, cooldown]) => {
//       const remainingDuration = this.cooldownRemaining(Number(spellId), timestamp);
//       if (remainingDuration <= 0) {
//         const expectedEnd = Math.round(
//           cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime,
//         );
//         debug && this.log('Clearing', spellName(Number(spellId)), spellId, 'due to expiry');
//         this.endCooldown(Number(spellId), false, expectedEnd);
//       }
//     });
//   }
//
//   _lastTimestamp: number = -1;
//
//   onEvent(event: AnyEvent) {
//     const timestamp = (event && event.timestamp) || this.owner.currentTimestamp;
//     //if cast event from previous phase was found, add it to the cooldown tracker without adding it to the phase itself
//     if (event.type === EventType.FilterCooldownInfo && timestamp === this._lastTimestamp) {
//       return;
//     }
//     this._lastTimestamp = timestamp;
//     this._checkCooldownExpiry(timestamp);
//   }
//
//   // Haste-based cooldowns gets longer/shorter when your Haste changes
//   // `newDuration = timePassed + (newCooldownDuration * (1 - progress))` (where `timePassed` is the time since the spell went on cooldown, `newCooldownDuration` is the full cooldown duration based on the new Haste, `progress` is the percentage of progress cooling down the spell)
//   onChangehaste(event: ChangeHasteEvent) {
//     Object.keys(this._currentCooldowns)
//       .map(Number)
//       .forEach((spellId) => {
//         const cooldown = this._currentCooldowns[spellId];
//         const originalExpectedDuration = cooldown.expectedDuration;
//         const cooldownTriggerEvent = cooldown.cooldownTriggerEvent;
//
//         const timePassed = event.timestamp - cooldown.start;
//         const progress = timePassed / originalExpectedDuration;
//
//         const cooldownDurationWithCurrentHaste = this.abilities.getExpectedCooldownDuration(
//           Number(spellId),
//           cooldownTriggerEvent,
//         );
//         if (cooldownDurationWithCurrentHaste === undefined) {
//           throw new Error(
//             `Attempting to get cooldown duration for spell with no ability info: ${spellId}`,
//           );
//         }
//         // The game only works with integers so round the new expected duration
//         const newExpectedDuration = Math.round(
//           timePassed +
//             this._calculateNewCooldownDuration(progress, cooldownDurationWithCurrentHaste),
//         );
//         // NOTE: This does NOT scale any cooldown reductions applicable, their reduction time is static. (confirmed for absolute reductions (1.5 seconds), percentual reductions might differ but it is unlikely)
//
//         cooldown.expectedDuration = newExpectedDuration;
//
//         debug &&
//           this.log(
//             'Adjusted',
//             spellName(spellId),
//             spellId,
//             'cooldown duration due to Haste change; old duration without CDRs:',
//             originalExpectedDuration,
//             'CDRs:',
//             cooldown.totalReductionTime,
//             'time expired:',
//             timePassed,
//             'progress:',
//             `${formatPercentage(progress)}%`,
//             'cooldown duration with current Haste:',
//             cooldownDurationWithCurrentHaste,
//             '(without CDRs)',
//             'actual new expected duration:',
//             newExpectedDuration,
//             '(without CDRs)',
//           );
//       });
//   }
//
//   onFightend() {
//     const timestamp = this.owner.fight.end_time;
//     // Get the remaining cooldowns in order of expiration
//     const expiringCooldowns = Object.keys(this._currentCooldowns)
//       .map(Number)
//       .map((spellId) => {
//         const remainingDuration = this.cooldownRemaining(spellId, timestamp);
//         return {
//           spellId,
//           remainingDuration,
//         };
//       })
//       .sort((a, b) => a.remainingDuration - b.remainingDuration);
//     // Expire them
//     expiringCooldowns.forEach(({ spellId }) => {
//       const cooldown = this._currentCooldowns[spellId];
//       const expectedEnd = Math.round(
//         cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime,
//       );
//       debug && this.log('Clearing', spellName(spellId), spellId, 'due to fightend');
//       this.endCooldown(Number(spellId), false, expectedEnd);
//     });
//   }
//
//   /**
//    * Correct the chargesOnCooldown after removing a maxCharge from the spellbook.
//    */
//   onMaxChargesDecreased(event: MaxChargesDecreased) {
//     const canSpellId = this._getCanonicalId(event.spellId);
//
//     if (this.isOnCooldown(canSpellId)) {
//       this._currentCooldowns[canSpellId].chargesOnCooldown -= event.by;
//     }
//   }
//
//   _calculateNewCooldownDuration(progress: number, newDuration: number) {
//     return newDuration * (1 - progress);
//   }
// }
//
// export default SpellUsable;
