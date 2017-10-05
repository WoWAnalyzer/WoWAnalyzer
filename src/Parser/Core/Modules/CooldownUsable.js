import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';

import CastEfficiency from './CastEfficiency';

const debug = true;

function spellName(spellId) {
  return SPELLS[spellId] ? SPELLS[spellId].name : '???';
}

class CooldownUsable extends Module {
  static dependencies = {
    castEfficiency: CastEfficiency,
  };
  _currentCooldowns = {};

  /**
   * Whether the spell can be cast. This is not the opposite of `isOnCooldown`! A spell with 2 charges, 1 available and 1 on cooldown would be both available and on cooldown at the same time.
   */
  isAvailable(spellId) {
    if (this.isOnCooldown(spellId)) {
      const maxCharges = this.castEfficiency.getMaxCharges(spellId);
      if (maxCharges > this._currentCooldowns[spellId].charges) {
        return true;
      }
      return false;
    } else {
      return true;
    }
  }
  /**
   * Whether the spell is on cooldown. If a spell has multiple charges with 1 charge on cooldown and 1 available, this will return `true`. Use `isAvailable` if you just want to know if a spell is castable. Use this if you want to know if a spell is current cooling down, regardless of being able to cast it.
   */
  isOnCooldown(spellId) {
    return !!this._currentCooldowns[spellId];
  }
  /**
   * Returns the amount of time remaining on the cooldown.
   * @param {number} spellId
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {number|null} Returns null if the spell isn't on cooldown.
   */
  cooldownRemaining(spellId, timestamp = this.owner.currentTimestamp) {
    if (!this.isOnCooldown(spellId)) {
      return null;
    }
    return this._currentCooldowns[spellId].expectedEnd - timestamp;
  }
  /**
   * Start the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {number|null} overrideDurationMs This allows you to override the duration of the cooldown. If this isn't provided, the cooldown is calculated like normal.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   */
  startCooldown(spellId, overrideDurationMs = null, timestamp = this.owner.currentTimestamp) {
    const expectedCooldownDuration = overrideDurationMs || this.castEfficiency.getExpectedCooldownDuration(spellId);
    if (!expectedCooldownDuration) {
      debug && console.warn('Spell', spellName(spellId), spellId, 'doesn\'t have a cooldown.');
      return;
    }

    if (!this.isOnCooldown(spellId)) {
      this._currentCooldowns[spellId] = {
        start: timestamp,
        expectedEnd: timestamp + expectedCooldownDuration,
        charges: 1,
      };
      this._triggerEvent('startcooldown', this._makeEvent(spellId, timestamp, this._currentCooldowns[spellId]));
    } else {
      if (this.isAvailable(spellId)) {
        // Another charge is available
        this._currentCooldowns[spellId].charges += 1;
        this._triggerEvent('startcooldowncharge', this._makeEvent(spellId, timestamp, this._currentCooldowns[spellId]));
      } else {
        console.error(
          formatDuration(this.owner.fightDuration / 1000),
          spellName(spellId), spellId, `was cast while already marked as on cooldown. It probably either has multiple charges, can be reset early, cooldown can be reduced, the configured CD is invalid, the Haste is too low, the combatlog records multiple casts per player cast (e.g. ticks of a channel) or this is a latency issue.`,
          'time passed:', (timestamp - this._currentCooldowns[spellId].start),
          'cooldown remaining:', this.cooldownRemaining(spellId, timestamp),
          'expectedCooldownDuration:', (this._currentCooldowns[spellId].expectedEnd - this._currentCooldowns[spellId].start)
        );
        this.finishCooldown(spellId, false, timestamp);
        this.startCooldown(spellId, overrideDurationMs, timestamp);
      }
    }
  }
  /**
   * Finishes the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {boolean} resetAllCharges Whether all charges should be reset or just the last stack. Does nothing for spells with just 1 stack.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   */
  finishCooldown(spellId, resetAllCharges = false, timestamp = this.owner.currentTimestamp) {
    if (!this.isOnCooldown(spellId)) {
      throw new Error(`Tried to finish the cooldown of ${spellId}, but it's not on cooldown.`);
    }

    const cooldown = this._currentCooldowns[spellId];
    if (cooldown.charges === 1 || resetAllCharges) {
      delete this._currentCooldowns[spellId];
      this._triggerEvent('finishcooldown', this._makeEvent(spellId, timestamp, {
        ...cooldown,
        end: timestamp,
      }));
    } else {
      // We have another charge ready to go on cooldown, this simply add a charge and then refreshes the cooldown (it doesn't cooldown simultaneously)
      cooldown.charges -= 1;
      this._triggerEvent('finishcooldowncharge', this._makeEvent(spellId, timestamp, cooldown));
      this.refreshCooldown(spellId, null, timestamp);
    }
  }
  /**
   * Refresh (restart) the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {number|null} overrideDurationMs This allows you to override the duration of the cooldown. If this isn't provided, the cooldown is calculated like normal.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
    calculated like normal.
   */
  refreshCooldown(spellId, overrideDurationMs = null, timestamp = this.owner.currentTimestamp) {
    if (!this.isOnCooldown(spellId)) {
      throw new Error(`Tried to refresh the cooldown of ${spellId}, but it's not on cooldown.`);
    }
    const expectedCooldownDuration = overrideDurationMs || this.castEfficiency.getExpectedCooldownDuration(spellId);
    if (!expectedCooldownDuration) {
      debug && console.warn('Spell', spellName(spellId), spellId, 'doesn\'t have a cooldown.');
      return;
    }

    this._currentCooldowns[spellId].expectedEnd = timestamp + expectedCooldownDuration;
    this._triggerEvent('refreshcooldown', this._makeEvent(spellId, timestamp, this._currentCooldowns[spellId]));
  }
  /**
   * Reduces the cooldown for the provided spell by the provided duration.
   * @param {number} spellId The ID of the spell.
   * @param {number} durationMs The duration to reduce the cooldown with, in milliseconds.
   * @param {number} timestamp Override the timestamp if it may be different from the current timestamp.
   * @returns {*}
   */
  reduceCooldown(spellId, durationMs, timestamp = this.owner.currentTimestamp) {
    if (!this._currentCooldowns[spellId]) {
      return null;
    }
    const cooldownRemaining = this.cooldownRemaining(spellId, timestamp);
    if (cooldownRemaining < durationMs) {
      this.finishCooldown(spellId, false, timestamp);
      return cooldownRemaining;
    } else {
      this._currentCooldowns[spellId].expectedEnd -= durationMs;
      return durationMs;
    }
  }

  _makeEvent(spellId, timestamp, others = {}) {
    return {
      spellId,
      timestamp: timestamp,
      ...others,
    };
  }
  _triggerEvent(eventType, event) {
    if (debug) {
      const spellId = event.spellId;
      const fightDuration = formatDuration((event.timestamp - this.owner.fight.start_time) / 1000);
      switch (eventType) {
        case 'startcooldown':
          console.log(fightDuration, 'Cooldown started:', spellName(spellId), spellId, `(charges on cooldown: ${this._currentCooldowns[spellId].charges})`);
          break;
        case 'startcooldowncharge':
          console.log(fightDuration, 'Used another charge:', spellName(spellId), spellId, `(charges on cooldown: ${this._currentCooldowns[spellId].charges})`);
          break;
        case 'refreshcooldown':
          console.log(fightDuration, 'Cooldown refreshed:', spellName(spellId), spellId);
          break;
        case 'finishcooldowncharge':
          console.log(fightDuration, 'Charge cooldown finished:', spellName(spellId), spellId, `(charges left on cooldown: ${this._currentCooldowns[spellId].charges})`);
          break;
        case 'finishcooldown':
          console.log(fightDuration, 'Cooldown finished:', spellName(spellId), spellId);
          break;
        default: break;
      }
    }

    this.owner.triggerEvent(eventType, event);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    this.startCooldown(spellId, null, event.timestamp);
  }
  on_event(_, event) {
    const timestamp = (event && event.timestamp) || this.owner.currentTimestamp;
    Object.keys(this._currentCooldowns).forEach(spellId => {
      const activeCooldown = this._currentCooldowns[spellId];
      if (timestamp > activeCooldown.expectedEnd) {
        // Using > instead of >= here since most events, when they're at the exact same time, still apply that frame.
        this.finishCooldown(Number(spellId), false, activeCooldown.expectedEnd);
      }
    });
  }
}

export default CooldownUsable;
