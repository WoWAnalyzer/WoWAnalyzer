import SPELLS from 'common/SPELLS';
import { formatPercentage } from 'common/format';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';
import Events, { AnyEvent, CastEvent, ChangeHasteEvent, EventType, FilterCooldownInfoEvent, UpdateSpellUsableEvent } from 'parser/core/Events';

import Abilities from '../../core/modules/Abilities';

const debug = false;
export const INVALID_COOLDOWN_CONFIG_LAG_MARGIN = 150; // not sure what this is based around, but <150 seems to catch most false positives
let fullExplanation = true;

function spellName(spellId: number) {
  return SPELLS[spellId] ? SPELLS[spellId].name : '???';
}

type CooldownInfo = {
  start: number,
  chargesOnCooldown: number,
  expectedDuration: number,
  totalReductionTime: number,
  cooldownTriggerEvent: AnyEvent,
}
/**
 * @property {EventEmitter} eventEmitter
 * @property {Abilities} abilities
 */
class SpellUsable extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    abilities: Abilities,
  };
  protected eventEmitter!: EventEmitter;
  protected abilities!: Abilities;

  _currentCooldowns: { [spellId: number]: CooldownInfo } = {};
  _errors = 0;

  get errorsPerMinute() {
    const minutesElapsed = (this.owner.fightDuration / 1000) / 60;
    return this._errors / minutesElapsed;
  }

  get isAccurate() {
    return this.errorsPerMinute < 1.5;
  }

  constructor(options: Options){
    super(options);
    this.addEventListener(Events.any, this.onEvent);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.prefiltercd.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(Events.ChangeHaste, this.onChangehaste);
    this.addEventListener(Events.fightend, this.onFightend);
  }

  /**
   * Find the canonical spell id of an ability. For most abilities, this
   * is just the spell ID. For abilities with shared CDs / charges, this is
   * the first ability in the list of abilities that share with it.
   */
  _getCanonicalId(spellId: number) {
    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      return spellId; // not a class ability
    }
    if (ability.spell instanceof Array) {
      return ability.spell[0].id;
    } else {
      return ability.spell.id;
    }
  }

  /**
   * Whether the spell can be cast. This is not the opposite of `isOnCooldown`!
   * A spell with 2 charges, 1 available and 1 on cooldown would be both
   * available and on cooldown at the same time
   */
  isAvailable(spellId: number) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      return true;
    }
    const maxCharges = this.abilities.getMaxCharges(canSpellId) || 1;
    if (maxCharges > this._currentCooldowns[canSpellId].chargesOnCooldown) {
      return true;
    }
    return false;
  }

  /**
   * For abilities with charges, gets the number of charges currently available.
   * @param spellId An ability spell id.
   * @returns The number of charges available for the given spell.
   * @throws Error if no ability definition found.
   */
  chargesAvailable(spellId: number) {
    const canSpellId = this._getCanonicalId(spellId);
    const maxCharges = this.abilities.getMaxCharges(canSpellId) || 1;
    if (this.isOnCooldown(canSpellId)) {
      return maxCharges - this._currentCooldowns[canSpellId].chargesOnCooldown;
    } else {
      return maxCharges;
    }
  }

  /**
   * Whether the spell is on cooldown. If a spell has multiple charges with 1 charge on cooldown and 1 available, this will return `true`. Use `isAvailable` if you just want to know if a spell is castable. Use this if you want to know if a spell is current cooling down, regardless of being able to cast it.
   */
  isOnCooldown(spellId: number) {
    const canSpellId = this._getCanonicalId(spellId);
    return Boolean(this._currentCooldowns[canSpellId]);
  }

  /**
   * Returns the amount of time remaining on the cooldown.
   * @param {number} spellId
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {number}
   */
  cooldownRemaining(spellId: number, timestamp = this.owner.currentTimestamp) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to retrieve the remaining cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const cooldown = this._currentCooldowns[canSpellId];
    const expectedEnd = Math.round(cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime);
    return expectedEnd - timestamp;
  }

  cooldownTriggerEvent(spellId: number) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to retrieve the remaining cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const cooldown = this._currentCooldowns[canSpellId];
    return cooldown.cooldownTriggerEvent;
  }

  /**
   * Start the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {object} cooldownTriggerEvent Which event triggered the cooldown. This MUST include a timestamp. This is used by potions to determine if it was a prepull cast, but may be used for other things too.
   */
  beginCooldown(spellId: number, cooldownTriggerEvent: AnyEvent) {
    if (process.env.NODE_ENV === 'development') {
      if (cooldownTriggerEvent.timestamp === undefined) {
        throw new Error('cooldownTriggerEvent must at least have a timestamp property.');
      }
    }

    const canSpellId = this._getCanonicalId(spellId);
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(canSpellId, cooldownTriggerEvent);
    if (!expectedCooldownDuration) {
      debug && this.warn('Spell', spellName(canSpellId), canSpellId, 'doesn\'t have a cooldown.');
      return;
    }

    if (!this.isOnCooldown(canSpellId)) {
      this._currentCooldowns[canSpellId] = {
        start: cooldownTriggerEvent.timestamp,
        cooldownTriggerEvent,
        expectedDuration: expectedCooldownDuration,
        totalReductionTime: 0,
        chargesOnCooldown: 1,
      };
      this._triggerEvent(this._makeEvent(canSpellId, cooldownTriggerEvent.timestamp, EventType.BeginCooldown));
    } else {
      if (this.isAvailable(canSpellId)) {
        // Another charge is available
        this._currentCooldowns[canSpellId].chargesOnCooldown += 1;
        this._triggerEvent(this._makeEvent(canSpellId, cooldownTriggerEvent.timestamp, EventType.AddCooldownCharge));
      } else {
        const remainingCooldown = this.cooldownRemaining(canSpellId, cooldownTriggerEvent.timestamp);
        if (remainingCooldown > INVALID_COOLDOWN_CONFIG_LAG_MARGIN) {
          // No need to report if it was expected to reset within the set margin, as latency can cause this fluctuation.
          // Count errors so we can disable features if this exceeds a threshold
          this._errors += 1;
          // Only mention reduction times if applicable (this is pretty rare)
          const reductionInfo = this._currentCooldowns[canSpellId].totalReductionTime > 0 ? [
            'totalReductionTime:', this._currentCooldowns[canSpellId].totalReductionTime,
            'adjusted expected duration:', this._currentCooldowns[canSpellId].expectedDuration - this._currentCooldowns[canSpellId].totalReductionTime,
          ] : [];
          if (fullExplanation) {
            this.error('A cooldown error has occured. The most likely cause is missing a Haste buff, but the cooldown might also have multiple charges, can be reset early, cooldown can be reduced, the configured CD is invalid, the combatlog records multiple casts per player cast (e.g. ticks of a channel) or this is a latency issue. There\'s already handling for latency, but if it\'s extremely high, there might still be false positives. But usually it\'s a Haste issue.');
          }
          this.error(
            spellName(canSpellId), canSpellId, 'was cast while already marked as on cooldown.',
            'time passed:', (cooldownTriggerEvent.timestamp - this._currentCooldowns[canSpellId].start),
            'cooldown remaining:', remainingCooldown,
            'expectedDuration:', this._currentCooldowns[canSpellId].expectedDuration,
            ...reductionInfo,
          );
          fullExplanation = false;
        }
        this.endCooldown(canSpellId, false, cooldownTriggerEvent.timestamp);
        this.beginCooldown(canSpellId, cooldownTriggerEvent);
      }
    }
  }

  /**
   * Finishes the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {boolean} resetAllCharges Whether all charges should be reset or just the last stack. Does nothing for spells with just 1 stack.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @param {number} remainingCDR For abilities with charges, the remaining cooldown reduction if the reduction is more than the remaining cooldown of the charge and more than 1 charge is on cooldown
   * @returns {*}
   */
  endCooldown(spellId: number, resetAllCharges = false, timestamp = this.owner.currentTimestamp, remainingCDR = 0): number {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      // We want implementers to check this themselves so they *have* to think about how to handle it properly in whatever module they're working on.
      throw new Error(`Tried to end the cooldown of ${canSpellId}, but it's not on cooldown.`);
    }

    const cooldown = this._currentCooldowns[canSpellId];
    if (cooldown.chargesOnCooldown === 1 || resetAllCharges) {
      delete this._currentCooldowns[canSpellId];
      this._triggerEvent(this._makeEvent(canSpellId, timestamp, EventType.EndCooldown, {
        ...cooldown,
        end: timestamp,
      }));
      return 0;
    } else {
      // We have another charge ready to go on cooldown, this simply adds a charge and then refreshes the cooldown (spells with charges don't cooldown simultaneously)
      cooldown.chargesOnCooldown -= 1;
      this._triggerEvent(this._makeEvent(canSpellId, timestamp, EventType.RestoreCharge, cooldown));
      this.refreshCooldown(canSpellId, {
        timestamp,
      });
      if (remainingCDR !== 0) {
        return this.reduceCooldown(canSpellId, remainingCDR, timestamp);
      }
    }
    return 0;
  }

  /**
   * Refresh (restart) the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {object} cooldownTriggerEvent Which event triggered the cooldown. This MUST include a timestamp. This is used by potions to determine if it was a prepull cast, but may be used for other things too.
   */
  refreshCooldown(spellId: number, cooldownTriggerEvent: { timestamp: number }) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to refresh the cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(canSpellId);
    if (!expectedCooldownDuration) {
      debug && this.warn('Spell', spellName(canSpellId), canSpellId, 'doesn\'t have a cooldown.');
      return;
    }

    this._currentCooldowns[canSpellId].start = cooldownTriggerEvent.timestamp;
    this._currentCooldowns[canSpellId].expectedDuration = expectedCooldownDuration;
    this._currentCooldowns[canSpellId].totalReductionTime = 0;
    this._triggerEvent(this._makeEvent(canSpellId, cooldownTriggerEvent.timestamp, EventType.RefreshCooldown));
  }

  /**
   * Reduces the cooldown for the provided spell by the provided duration.
   * @param {number} spellId The ID of the spell.
   * @param {number} reductionMs The duration to reduce the cooldown with, in milliseconds.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {number}
   */
  reduceCooldown(spellId: number, reductionMs: number, timestamp = this.owner.currentTimestamp) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to reduce the cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const cooldownRemaining = this.cooldownRemaining(canSpellId, timestamp);
    if (cooldownRemaining < reductionMs) {
      const remainingCDR = reductionMs - cooldownRemaining;
      return cooldownRemaining + this.endCooldown(canSpellId, false, timestamp, remainingCDR);
    } else {
      this._currentCooldowns[canSpellId].totalReductionTime += reductionMs;
      debug && this.log('Reduced', spellName(canSpellId), canSpellId, 'by', reductionMs, 'remaining:', this.cooldownRemaining(canSpellId, timestamp), 'old:', cooldownRemaining, 'new expected duration:', this._currentCooldowns[canSpellId].expectedDuration - this._currentCooldowns[canSpellId].totalReductionTime, 'total CDR:', this._currentCooldowns[canSpellId].totalReductionTime);
      return reductionMs;
    }
  }

  /**
   * Extends the cooldown for the provided spell by the provided duration.
   * @param {any} spellId The ID of the spell.
   * @param {number} extensionMS The duration to extend the cooldown with, in milliseconds.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {*}
   */
  extendCooldown(spellId: number, extensionMS: number, timestamp = this.owner.currentTimestamp) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to extend the cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const cooldownRemaining = this.cooldownRemaining(canSpellId, timestamp);
    this._currentCooldowns[canSpellId].totalReductionTime -= extensionMS;
    debug && this.log('Extended', spellName(canSpellId), canSpellId, 'by', extensionMS, 'remaining:', this.cooldownRemaining(canSpellId, timestamp), 'old:', cooldownRemaining, 'new expected duration:', this._currentCooldowns[canSpellId].expectedDuration - this._currentCooldowns[canSpellId].totalReductionTime, 'total extension:', -this._currentCooldowns[canSpellId].totalReductionTime);
    return extensionMS;
  }

  _makeEvent(spellId: number, timestamp: number, trigger: UpdateSpellUsableEvent['trigger'], others = {}): UpdateSpellUsableEvent {
    const cooldown = this._currentCooldowns[spellId];
    const chargesOnCooldown = cooldown ? cooldown.chargesOnCooldown : 0;
    const ability = this.abilities.getAbility(spellId);
    const maxCharges = this.abilities.getMaxCharges(spellId) || 1;
    const spell = SPELLS[spellId];

    return {
      type: EventType.UpdateSpellUsable,
      ability: {
        guid: spellId,
        name: spell.name!,
        abilityIcon: spell.icon!,
      },
      name: ability ? ability.name : undefined,
      trigger,
      timestamp,
      isOnCooldown: this.isOnCooldown(spellId),
      isAvailable: this.isAvailable(spellId),
      chargesAvailable: maxCharges - chargesOnCooldown,
      maxCharges,
      timePassed: cooldown ? timestamp - cooldown.start : undefined,
      sourceID: this.owner.playerId,
      targetIsFriendly: true,
      targetID: this.owner.playerId,
      // __fabricated is technically added in eventemitter, but it makes typing much simpler to add it here
      __fabricated: true,
      ...cooldown,
      ...others,
    };
  }

  _triggerEvent(event: UpdateSpellUsableEvent) {
    if (debug) {
      const spellId = event.ability.guid;
      switch (event.trigger) {
        case EventType.BeginCooldown:
          this.log('Cooldown started:', spellName(spellId), spellId, 'expected duration:', event.expectedDuration, `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case EventType.AddCooldownCharge:
          this.log('Used another charge:', spellName(spellId), spellId, `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case EventType.RefreshCooldown:
          this.log('Cooldown refreshed:', spellName(spellId), spellId);
          break;
        case EventType.RestoreCharge:
          this.log('Charge restored:', spellName(spellId), spellId, `(charges left on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case EventType.EndCooldown:
          this.log('Cooldown finished:', spellName(spellId), spellId);
          break;
        default:
          break;
      }
    }

    this.eventEmitter.fabricateEvent(event);
  }

  onCast(event: CastEvent | FilterCooldownInfoEvent) {
    const spellId = event.ability.guid;
    this.beginCooldown(spellId, event);
  }

  _checkCooldownExpiry(timestamp: number) {
    Object.keys(this._currentCooldowns).map(Number).forEach(spellId => {
      const remainingDuration = this.cooldownRemaining(spellId, timestamp);
      if (remainingDuration <= 0) {
        const cooldown = this._currentCooldowns[spellId];
        const expectedEnd = Math.round(cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime);
        debug && this.log('Clearing', spellName(spellId), spellId, 'due to expiry');
        this.endCooldown(Number(spellId), false, expectedEnd);
      }
    });
  }

  _lastTimestamp: number = -1;

  onEvent(event: AnyEvent) {
    const timestamp = (event && event.timestamp) || this.owner.currentTimestamp;
    //if cast event from previous phase was found, add it to the cooldown tracker without adding it to the phase itself
    if (event.type === EventType.FilterCooldownInfo && timestamp === this._lastTimestamp) {
      return;
    }
    this._lastTimestamp = timestamp;
    this._checkCooldownExpiry(timestamp);
  }

  // Haste-based cooldowns gets longer/shorter when your Haste changes
  // `newDuration = timePassed + (newCooldownDuration * (1 - progress))` (where `timePassed` is the time since the spell went on cooldown, `newCooldownDuration` is the full cooldown duration based on the new Haste, `progress` is the percentage of progress cooling down the spell)
  onChangehaste(event: ChangeHasteEvent) {
    Object.keys(this._currentCooldowns).map(Number).forEach(spellId => {
      const cooldown = this._currentCooldowns[spellId];
      const originalExpectedDuration = cooldown.expectedDuration;
      const cooldownTriggerEvent = cooldown.cooldownTriggerEvent;

      const timePassed = event.timestamp - cooldown.start;
      const progress = timePassed / originalExpectedDuration;

      const cooldownDurationWithCurrentHaste = this.abilities.getExpectedCooldownDuration(Number(spellId), cooldownTriggerEvent);
      if (cooldownDurationWithCurrentHaste === undefined) {
        throw new Error(`Attempting to get cooldown duration for spell with no ability info: ${spellId}`);
      }
      // The game only works with integers so round the new expected duration
      const newExpectedDuration = Math.round(timePassed + this._calculateNewCooldownDuration(progress, cooldownDurationWithCurrentHaste));
      // NOTE: This does NOT scale any cooldown reductions applicable, their reduction time is static. (confirmed for absolute reductions (1.5 seconds), percentual reductions might differ but it is unlikely)

      cooldown.expectedDuration = newExpectedDuration;

      debug && this.log('Adjusted', spellName(spellId), spellId, 'cooldown duration due to Haste change; old duration without CDRs:', originalExpectedDuration, 'CDRs:', cooldown.totalReductionTime, 'time expired:', timePassed, 'progress:', `${formatPercentage(progress)}%`, 'cooldown duration with current Haste:', cooldownDurationWithCurrentHaste, '(without CDRs)', 'actual new expected duration:', newExpectedDuration, '(without CDRs)');
    });
  }

  onFightend() {
    const timestamp = this.owner.fight.end_time;
    // Get the remaining cooldowns in order of expiration
    const expiringCooldowns = Object.keys(this._currentCooldowns).map(Number).map(spellId => {
      const remainingDuration = this.cooldownRemaining(spellId, timestamp);
      return {
        spellId,
        remainingDuration,
      };
    }).sort((a, b) => a.remainingDuration - b.remainingDuration);
    // Expire them
    expiringCooldowns.forEach(({ spellId }) => {
      const cooldown = this._currentCooldowns[spellId];
      const expectedEnd = Math.round(cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime);
      debug && this.log('Clearing', spellName(spellId), spellId, 'due to fightend');
      this.endCooldown(Number(spellId), false, expectedEnd);
    });
  }

  _calculateNewCooldownDuration(progress: number, newDuration: number) {
    return newDuration * (1 - progress);
  }
}

export default SpellUsable;
