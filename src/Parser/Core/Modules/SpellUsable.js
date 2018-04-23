import SPELLS from 'common/SPELLS';
import { formatMilliseconds, formatPercentage } from 'common/format';

import Analyzer from 'Parser/Core/Analyzer';

import Abilities from './Abilities';

const debug = false;
const INVALID_COOLDOWN_CONFIG_LAG_MARGIN = 150; // not sure what this is based around, but <150 seems to catch most false positives

function spellName(spellId) {
  return SPELLS[spellId] ? SPELLS[spellId].name : '???';
}

class SpellUsable extends Analyzer {
  static dependencies = {
    abilities: Abilities,
  };
  _currentCooldowns = {};
  _errors = 0;
  get errorsPerMinute() {
    const minutesElapsed = (this.owner.fightDuration / 1000) / 60;
    return this._errors / minutesElapsed;
  }
  get isAccurate() {
    return this.errorsPerMinute < 1;
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
    const expectedEnd = cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime;
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
      debug && console.warn('SpellUsable', 'Spell', spellName(canSpellId), canSpellId, 'doesn\'t have a cooldown.');
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
          this._errors += 1;
          console.error(
            formatMilliseconds(this.owner.fightDuration),
            'SpellUsable',
            spellName(canSpellId), canSpellId, `was cast while already marked as on cooldown. It probably either has multiple charges, can be reset early, cooldown can be reduced, the configured CD is invalid, the Haste is too low, the combatlog records multiple casts per player cast (e.g. ticks of a channel) or this is a latency issue.`,
            'fight time:', timestamp - this.owner.fight.start_time,
            'time passed:', (timestamp - this._currentCooldowns[canSpellId].start),
            'cooldown remaining:', remainingCooldown,
            'expectedDuration:', this._currentCooldowns[canSpellId].expectedDuration,
            'totalReductionTime:', this._currentCooldowns[canSpellId].totalReductionTime,
            'adjusted expected duration:', this._currentCooldowns[canSpellId].expectedDuration - this._currentCooldowns[canSpellId].totalReductionTime
          );
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
      debug && console.warn('SpellUsable', 'Spell', spellName(canSpellId), canSpellId, 'doesn\'t have a cooldown.');
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
      const fightDuration = formatMilliseconds(timestamp - this.owner.fight.start_time);
      debug && console.log(fightDuration, 'SpellUsable', 'Reduced', spellName(canSpellId), canSpellId, 'by', reductionMs, 'remaining:', this.cooldownRemaining(canSpellId, timestamp), 'old:', cooldownRemaining, 'new expected duration:', this._currentCooldowns[canSpellId].expectedDuration - this._currentCooldowns[canSpellId].totalReductionTime, 'total CDR:', this._currentCooldowns[canSpellId].totalReductionTime);
      return reductionMs;
    }
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
      const fightDuration = formatMilliseconds(event.timestamp - this.owner.fight.start_time);
      switch (event.trigger) {
        case 'begincooldown':
          console.log(fightDuration, 'SpellUsable', 'Cooldown started:', spellName(spellId), spellId, 'expected duration:', event.expectedDuration, `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case 'addcooldowncharge':
          console.log(fightDuration, 'SpellUsable', 'Used another charge:', spellName(spellId), spellId, `(charges on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case 'refreshcooldown':
          console.log(fightDuration, 'SpellUsable', 'Cooldown refreshed:', spellName(spellId), spellId);
          break;
        case 'restorecharge':
          console.log(fightDuration, 'SpellUsable', 'Charge restored:', spellName(spellId), spellId, `(charges left on cooldown: ${this._currentCooldowns[spellId].chargesOnCooldown})`);
          break;
        case 'endcooldown':
          console.log(fightDuration, 'SpellUsable', 'Cooldown finished:', spellName(spellId), spellId);
          break;
        default:
          break;
      }
    }

    this.owner.fabricateEvent(event);
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
        const expectedEnd = cooldown.start + cooldown.expectedDuration - cooldown.totalReductionTime;
        const fightDuration = formatMilliseconds(timestamp - this.owner.fight.start_time);
        debug && console.log(fightDuration, 'SpellUsable', 'Clearing', spellName(spellId), spellId, 'due to expiry');
        this.endCooldown(Number(spellId), false, expectedEnd);
      }
    });
  }
  _isCheckingCooldowns = false;
  on_event(_, event) {
    if (!this._isCheckingCooldowns) {
      // This ensures this method isn't called again before it's finished executing (_checkCooldowns might trigger events).
      this._isCheckingCooldowns = true;
      this._checkCooldownExpiry((event && event.timestamp) || this.owner.currentTimestamp);
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
      const newExpectedDuration = timePassed + this._calculateNewCooldownDuration(progress, cooldownDurationWithCurrentHaste);
      const fightDuration = formatMilliseconds(event.timestamp - this.owner.fight.start_time);
      // NOTE: This does NOT scale any cooldown reductions applicable, their reduction time is static. (confirmed for absolute reductions (1.5 seconds), percentual reductions might differ but it is unlikely)

      cooldown.expectedDuration = newExpectedDuration;

      debug && console.log(fightDuration, 'SpellUsable', 'Adjusted', spellName(spellId), spellId, 'cooldown duration due to Haste change; old duration without CDRs:', originalExpectedDuration, 'CDRs:', cooldown.totalReductionTime, 'time expired:', timePassed, 'progress:', `${formatPercentage(progress)}%`, 'cooldown duration with current Haste:', cooldownDurationWithCurrentHaste, '(without CDRs)', 'actual new expected duration:', newExpectedDuration, '(without CDRs)');
    });
  }
  _calculateNewCooldownDuration(progress, newDuration) {
    return newDuration * (1 - progress);
  }
}

export default SpellUsable;
