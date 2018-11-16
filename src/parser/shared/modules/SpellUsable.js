import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import EventEmitter from 'parser/core/modules/EventEmitter';

import Abilities from './Abilities';

const debug = false;
const INVALID_COOLDOWN_CONFIG_LAG_MARGIN = 150; // not sure what this is based around, but <150 seems to catch most false positives
let fullExplanation = true;

function spellName(spellId) {
  return SPELLS[spellId] ? SPELLS[spellId].name : '???';
}

class SpellUsable extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    abilities: Abilities,
  };

  _currentCooldowns = {};
  _errors = 0;
  get errorsPerMinute() {
    const minutesElapsed = (this.owner.fightDuration / 1000) / 60;
    return this._errors / minutesElapsed;
  }
  get isAccurate() {
    return this.errorsPerMinute < 1.5;
  }

  /**
   * Find the canonical spell id of an ability. For most abilities, this
   * is just the spell ID. For abilities with shared CDs / charges, this is
   * the first ability in the list of abilities that share with it.
   */
  _getCanonicalId(spellId) {
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
   * Whether the spell can be cast. This is not the opposite of `isOnCooldown`! A spell with 2 charges, 1 available and 1 on cooldown would be both available and on cooldown at the same time
   */
  isAvailable(spellId) {
    const canSpellId = this._getCanonicalId(spellId);
    if (this.isOnCooldown(canSpellId)) {
      const maxCharges = this.abilities.getMaxCharges(canSpellId);
      if (maxCharges > this._currentCooldowns[canSpellId].chargesOnCooldown) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  }

  /**
   * For abilities with charges. Returns the number of charges that are available for a particular spell.
   */
  chargesAvailable(spellId) {
    const canSpellId = this._getCanonicalId(spellId);
    if (this.isOnCooldown(canSpellId)) {
      return this.abilities.getMaxCharges(canSpellId) - this._currentCooldowns[canSpellId].chargesOnCooldown;
    } else {
      return this.abilities.getMaxCharges(canSpellId);
    }
  }
  /**
   * Whether the spell is on cooldown. If a spell has multiple charges with 1 charge on cooldown and 1 available, this will return `true`. Use `isAvailable` if you just want to know if a spell is castable. Use this if you want to know if a spell is current cooling down, regardless of being able to cast it.
   */
  isOnCooldown(spellId) {
    const canSpellId = this._getCanonicalId(spellId);
    return !!this._currentCooldowns[canSpellId];
  }
  /**
   * Returns the amount of time remaining on the cooldown.
   * @param {number} spellId
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {number|null} Returns null if the spell isn't on cooldown.
   */
  cooldownRemaining(spellId, timestamp = this.owner.currentTimestamp) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to retrieve the remaining cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const cooldown = this._currentCooldowns[canSpellId];
    const expectedEnd = Math.round(cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime);
    return expectedEnd - timestamp;
  }
  /**
   * Start the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   */
  beginCooldown(spellId, timestamp = this.owner.currentTimestamp) {
    const canSpellId = this._getCanonicalId(spellId);
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(canSpellId);
    if (!expectedCooldownDuration) {
      debug && this.warn('Spell', spellName(canSpellId), canSpellId, 'doesn\'t have a cooldown.');
      return;
    }

    if (!this.isOnCooldown(canSpellId)) {
      this._currentCooldowns[canSpellId] = {
        start: timestamp,
        expectedDuration: expectedCooldownDuration,
        totalReductionTime: 0,
        chargesOnCooldown: 1,
      };
      this._triggerEvent(this._makeEvent(canSpellId, timestamp, 'begincooldown'));
    } else {
      if (this.isAvailable(canSpellId)) {
        // Another charge is available
        this._currentCooldowns[canSpellId].chargesOnCooldown += 1;
        this._triggerEvent(this._makeEvent(canSpellId, timestamp, 'addcooldowncharge'));
      } else {
        const remainingCooldown = this.cooldownRemaining(canSpellId, timestamp);
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
            'time passed:', (timestamp - this._currentCooldowns[canSpellId].start),
            'cooldown remaining:', remainingCooldown,
            'expectedDuration:', this._currentCooldowns[canSpellId].expectedDuration,
            ...reductionInfo,
          );
          fullExplanation = false;
        }
        this.endCooldown(canSpellId, false, timestamp);
        this.beginCooldown(canSpellId, timestamp);
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
  endCooldown(spellId, resetAllCharges = false, timestamp = this.owner.currentTimestamp, remainingCDR = 0) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      // We want implementers to check this themselves so they *have* to think about how to handle it properly in whatever module they're working on.
      throw new Error(`Tried to end the cooldown of ${canSpellId}, but it's not on cooldown.`);
    }

    const cooldown = this._currentCooldowns[canSpellId];
    if (cooldown.chargesOnCooldown === 1 || resetAllCharges) {
      delete this._currentCooldowns[canSpellId];
      this._triggerEvent(this._makeEvent(canSpellId, timestamp, 'endcooldown', {
        ...cooldown,
        end: timestamp,
      }));
      return 0;
    } else {
      // We have another charge ready to go on cooldown, this simply adds a charge and then refreshes the cooldown (spells with charges don't cooldown simultaneously)
      cooldown.chargesOnCooldown -= 1;
      this._triggerEvent(this._makeEvent(canSpellId, timestamp, 'restorecharge', cooldown));
      this.refreshCooldown(canSpellId, timestamp);
      if (remainingCDR !== 0) {
        return this.reduceCooldown(canSpellId, remainingCDR, timestamp);
      }
    }
    return 0;
  }
  /**
   * Refresh (restart) the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   calculated like normal.
   */
  refreshCooldown(spellId, timestamp = this.owner.currentTimestamp) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to refresh the cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const expectedCooldownDuration = this.abilities.getExpectedCooldownDuration(canSpellId);
    if (!expectedCooldownDuration) {
      debug && this.warn('Spell', spellName(canSpellId), canSpellId, 'doesn\'t have a cooldown.');
      return;
    }

    this._currentCooldowns[canSpellId].start = timestamp;
    this._currentCooldowns[canSpellId].expectedDuration = expectedCooldownDuration;
    this._currentCooldowns[canSpellId].totalReductionTime = 0;
    this._triggerEvent(this._makeEvent(canSpellId, timestamp, 'refreshcooldown'));
  }
  /**
   * Reduces the cooldown for the provided spell by the provided duration.
   * @param {number} spellId The ID of the spell.
   * @param {number} reductionMs The duration to reduce the cooldown with, in milliseconds.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {*}
   */
  reduceCooldown(spellId, reductionMs, timestamp = this.owner.currentTimestamp) {
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
  extendCooldown(spellId, extensionMS, timestamp = this.owner.currentTimestamp) {
    const canSpellId = this._getCanonicalId(spellId);
    if (!this.isOnCooldown(canSpellId)) {
      throw new Error(`Tried to extend the cooldown of ${canSpellId}, but it's not on cooldown.`);
    }
    const cooldownRemaining = this.cooldownRemaining(canSpellId, timestamp);
    this._currentCooldowns[canSpellId].totalReductionTime -= extensionMS;
    debug && this.log('Extended', spellName(canSpellId), canSpellId, 'by', extensionMS, 'remaining:', this.cooldownRemaining(canSpellId, timestamp), 'old:', cooldownRemaining, 'new expected duration:', this._currentCooldowns[canSpellId].expectedDuration - this._currentCooldowns[canSpellId].totalReductionTime, 'total extension:', -this._currentCooldowns[canSpellId].totalReductionTime);
    return extensionMS;
  }

  _makeEvent(spellId, timestamp, trigger, others = {}) {
    const cooldown = this._currentCooldowns[spellId];
    const chargesOnCooldown = cooldown ? cooldown.chargesOnCooldown : 0;
    const maxCharges = this.abilities.getMaxCharges(spellId) || 1;
    return {
      type: 'updatespellusable',
      ability: {
        guid: spellId,
      },
      trigger,
      timestamp,
      isOnCooldown: this.isOnCooldown(spellId),
      isAvailable: this.isAvailable(spellId),
      chargesAvailable: maxCharges - chargesOnCooldown,
      maxCharges,
      timePassed: cooldown ? timestamp - cooldown.start : undefined,
      sourceID: this.owner.playerId,
      targetID: this.owner.playerId,
      ...cooldown,
      ...others,
    };
  }
  _triggerEvent(event) {
    if (debug) {
      const spellId = event.ability.guid;
      switch (event.trigger) {
        case 'begincooldown':
          this.log('Cooldown started:', spellName(spellId), spellId, 'expected duration:', event.expectedDuration, `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case 'addcooldowncharge':
          this.log('Used another charge:', spellName(spellId), spellId, `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case 'refreshcooldown':
          this.log('Cooldown refreshed:', spellName(spellId), spellId);
          break;
        case 'restorecharge':
          this.log('Charge restored:', spellName(spellId), spellId, `(charges left on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case 'endcooldown':
          this.log('Cooldown finished:', spellName(spellId), spellId);
          break;
        default:
          break;
      }
    }

    this.eventEmitter.fabricateEvent(event);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    this.beginCooldown(spellId, event.timestamp);
  }
  _checkCooldownExpiry(timestamp) {
    Object.keys(this._currentCooldowns).forEach(spellId => {
      const remainingDuration = this.cooldownRemaining(spellId, timestamp);
      if (remainingDuration <= 0) {
        const cooldown = this._currentCooldowns[spellId];
        const expectedEnd = Math.round(cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime);
        debug && this.log('Clearing', spellName(spellId), spellId, 'due to expiry');
        this.endCooldown(Number(spellId), false, expectedEnd);
      }
    });
  }
  _isCheckingCooldowns = false;
  on_event(event) {
    if (!this._isCheckingCooldowns) {
      // This ensures this method isn't called again before it's finished executing (_checkCooldowns might trigger events).
      this._isCheckingCooldowns = true;
      const timestamp = (event && event.timestamp) || this.owner.currentTimestamp;
      this._checkCooldownExpiry(timestamp);
      this._isCheckingCooldowns = false;
    }
  }
  // Haste-based cooldowns gets longer/shorter when your Haste changes
  // `newDuration = timePassed + (newCooldownDuration * (1 - progress))` (where `timePassed` is the time since the spell went on cooldown, `newCooldownDuration` is the full cooldown duration based on the new Haste, `progress` is the percentage of progress cooling down the spell)
  on_changehaste(event) {
    Object.keys(this._currentCooldowns).forEach(spellId => {
      const cooldown = this._currentCooldowns[spellId];
      const originalExpectedDuration = cooldown.expectedDuration;

      const timePassed = event.timestamp - cooldown.start;
      const progress = timePassed / originalExpectedDuration;

      const cooldownDurationWithCurrentHaste = this.abilities.getExpectedCooldownDuration(Number(spellId));
      // The game only works with integers so round the new expected duration
      const newExpectedDuration = Math.round(timePassed + this._calculateNewCooldownDuration(progress, cooldownDurationWithCurrentHaste));
      // NOTE: This does NOT scale any cooldown reductions applicable, their reduction time is static. (confirmed for absolute reductions (1.5 seconds), percentual reductions might differ but it is unlikely)

      cooldown.expectedDuration = newExpectedDuration;

      debug && this.log('Adjusted', spellName(spellId), spellId, 'cooldown duration due to Haste change; old duration without CDRs:', originalExpectedDuration, 'CDRs:', cooldown.totalReductionTime, 'time expired:', timePassed, 'progress:', `${formatPercentage(progress)}%`, 'cooldown duration with current Haste:', cooldownDurationWithCurrentHaste, '(without CDRs)', 'actual new expected duration:', newExpectedDuration, '(without CDRs)');
    });
  }
  _calculateNewCooldownDuration(progress, newDuration) {
    return newDuration * (1 - progress);
  }
}

export default SpellUsable;
