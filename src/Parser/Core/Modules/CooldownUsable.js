import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';

import Combatants from './Combatants';
import CastEfficiency from './CastEfficiency';
import Haste from './Haste';

const debug = true;

function spellName(spellId) {
  return SPELLS[spellId] ? SPELLS[spellId].name : '???';
}

class CooldownUsable extends Module {
  static dependencies = {
    combatants: Combatants,
    castEfficiency: CastEfficiency,
    haste: Haste,
  };
  _currentCooldowns = {};

  /**
   * Whether the spell can be cast. This is not the opposite of `isOnCooldown`! A spell with 2 charges, 1 available and 1 on cooldown would be both available and on cooldown at the same time.
   */
  isAvailable(spellId) {
    if (this._currentCooldowns[spellId]) {
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
   * Start the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {number|null} overrideDurationMs This allows you to override the duration of the cooldown. If this isn't provided, the cooldown is calculated like normal.
   */
  startCooldown(spellId, overrideDurationMs = null) {
    const expectedCooldownDuration = overrideDurationMs || this.castEfficiency.getExpectedCooldownDuration(spellId);
    if (!expectedCooldownDuration) {
      debug && console.warn('Spell', spellName(spellId), spellId, 'doesn\'t have a cooldown.');
      return;
    }

    if (!this._currentCooldowns[spellId]) {
      this._currentCooldowns[spellId] = {
        start: this.owner.currentTimestamp,
        expectedEnd: this.owner.currentTimestamp + expectedCooldownDuration,
        charges: 1,
      };
    } else {
      const maxCharges = this.castEfficiency.getMaxCharges(spellId);

      if (maxCharges > this._currentCooldowns[spellId].charges) {
        this._currentCooldowns[spellId].charges += 1;
        this.restartCooldown(spellId, overrideDurationMs);
      } else {
        console.error('At', formatDuration(this.owner.fightDuration / 1000), spellName(spellId), spellId, `was cast while already marked as on cooldown. It probably either has multiple charges, can be reset early or reduced, the configured CD is invalid, the Haste is too low, or this is a latency issue. expectedCooldownDuration:`, expectedCooldownDuration, '(if this was cast now, Haste when the cooldown started might have been different)');
      }
    }
    debug && console.log('Cooldown started:', spellName(spellId), spellId, `(charges on cooldown: ${this._currentCooldowns[spellId].charges})`);
    this.owner.triggerEvent('startcooldown');
  }
  /**
   * Finishes the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {boolean} resetAllCharges Whether all charges should be reset or just the last stack. Does nothing for spells with just 1 stack.
   */
  finishCooldown(spellId, resetAllCharges = false) {
    if (this._currentCooldowns[spellId].charges === 1 || resetAllCharges) {
      delete this._currentCooldowns[spellId];
    } else {
      this._currentCooldowns[spellId].charges -= 1;
      // this.startCooldown(spellId);
    }
    debug && console.log('Cooldown ended:', spellName(spellId), spellId); // spells should always be set since this is based on CastEfficiency
    this.owner.triggerEvent('finishcooldown');
  }
  /**
   * Restart the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {number|null} overrideDurationMs This allows you to override the duration of the cooldown. If this isn't provided, the cooldown is calculated like normal.
   */
  restartCooldown(spellId, overrideDurationMs = null) {
    if (!this._currentCooldowns[spellId]) {
      throw new Error('Can\'t restart cooldown since the spell isn\'t on cooldown.');
    }
    const expectedCooldownDuration = overrideDurationMs || this.castEfficiency.getExpectedCooldownDuration(spellId);
    if (!expectedCooldownDuration) {
      debug && console.warn('Spell', spellName(spellId), spellId, 'doesn\'t have a cooldown.');
      return;
    }

    this._currentCooldowns[spellId].expectedEnd = this.owner.currentTimestamp + expectedCooldownDuration;
  }
  /**
   * Reduces the cooldown for the provided spell by the provided duration.
   * @param {number} spellId The ID of the spell.
   * @param {number} durationMs The duration to reduce the cooldown with, in milliseconds.
   * @returns {*}
   */
  reduceCooldown(spellId, durationMs) {
    if (!this._currentCooldowns[spellId]) {
      return null;
    }
    const now = this.owner.currentTimestamp;
    const expectedEnd = this._currentCooldowns[spellId].expectedEnd;
    const cooldownRemaining = expectedEnd - now;
    if (cooldownRemaining < durationMs) {
      this.finishCooldown(spellId);
      return cooldownRemaining;
    } else {
      this._currentCooldowns[spellId].expectedEnd -= durationMs;
      return durationMs;
    }
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    this.startCooldown(spellId);
  }
  on_event(_, event) {
    if (!event) {
      // Custom events may not have an event attribute.
      return;
    }
    const timestamp = event.timestamp;
    Object.keys(this._currentCooldowns).forEach(spellId => {
      const activeCooldown = this._currentCooldowns[spellId];
      if (timestamp > activeCooldown.expectedEnd) {
        // Using > instead of >= here since most events, when they're at the exact same time, still apply that frame.
        this.finishCooldown(spellId);
      }
    });
  }
}

export default CooldownUsable;
