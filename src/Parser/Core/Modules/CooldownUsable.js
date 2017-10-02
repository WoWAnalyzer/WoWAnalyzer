import SPELLS from 'common/SPELLS';
import { formatDuration } from 'common/format';

import Module from 'Parser/Core/Module';

import Combatants from './Combatants';
import CastEfficiency from './CastEfficiency';
import Haste from './Haste';

const debug = true;

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
    // TODO: Check for stacks
    return !this._currentCooldowns[spellId];
  }
  /**
   * Whether the spell is on cooldown. If a spell has multiple charges with 1 charge on cooldown and 1 available, this will return `true`. Use `isAvailable` if you just want to know if a spell is castable. Use this if you want to know if a spell is current cooling down, regardless of being able to cast it.
   */
  isOnCooldown(spellId) {
    // TODO: Check for stacks
    return !!this._currentCooldowns[spellId];
  }
  /**
   * Start the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {number|null} durationMs This allows you to override the duration of the cooldown. If this isn't provided, the cooldown is calculated like normal.
   */
  startCooldown(spellId, durationMs = null) {
    const expectedCooldownDuration = durationMs || this.getExpectedCooldownDuration(spellId);
    if (!expectedCooldownDuration) {
      debug && console.warn('Spell', SPELLS[spellId] && SPELLS[spellId].name, spellId, 'doesn\'t have a cooldown.');
      return;
    }
    this._currentCooldowns[spellId] = {
      start: this.owner.currentTimestamp,
      expectedEnd: this.owner.currentTimestamp + expectedCooldownDuration,
    };
  }
  /**
   * Resets the cooldown for the provided spell.
   * @param {number} spellId The ID of the spell.
   * @param {boolean} resetAllStacks Whether all stacks should be reset or just the last stack. Does nothing for spells with just 1 stack.
   */
  resetCooldown(spellId, resetAllStacks = false) {
    // TODO: If this spell has multiple charges, and more than 1 charge is on cooldown, then we should just start the full CD again unless `resetAllStacks` is true
    delete this._currentCooldowns[spellId];
    debug && console.log('Cooldown ended:', SPELLS[spellId] && SPELLS[spellId].name, spellId); // spells should always be set since this is based on CastEfficiency
    this.owner.triggerEvent('finishcooldown');
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
      this.resetCooldown(spellId);
      return cooldownRemaining;
    } else {
      this._currentCooldowns[spellId].expectedEnd -= durationMs;
      return durationMs;
    }
  }
  _getKnownAbilities() {
    return this.castEfficiency.constructor.CPM_ABILITIES;
  }
  _getKnownAbility(spellId) {
    return this._getKnownAbilities().find(ability => {
      if (ability.spell.id === spellId) {
        return !ability.isActive || ability.isActive(this.combatants.selected);
      }
      return false;
    });
  }
  getExpectedCooldownDuration(spellId) {
    const ability = this._getKnownAbility(spellId);
    return ability ? (ability.getCooldown(this.haste.current, this.combatants.selected) * 1000) : undefined;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this._currentCooldowns[spellId]) {
      this.startCooldown(spellId);
      debug && console.log('Cooldown started:', event.ability.name, event.ability.guid);
      this.owner.triggerEvent('startcooldown');
    } else {
      const expectedCooldownDuration = this.getExpectedCooldownDuration(spellId);
      // TODO: When we support charges, this should increment chargesOnCooldown (or something like that) by 1. For now it helps debugging to warn.
      console.error('At', formatDuration((event.timestamp - this.owner.fight.start_time) / 1000), event.ability.name, `was cast while already marked as on cooldown, does this have multiple stacks? expectedCooldownDuration:`, expectedCooldownDuration);
    }
  }
  on_event(_, event) {
    if (!event) {
      // Not all custom events have an event argument
      return;
    }
    const timestamp = event.timestamp;
    Object.keys(this._currentCooldowns).forEach(spellId => {
      const activeCooldown = this._currentCooldowns[spellId];
      if (timestamp > activeCooldown.expectedEnd) {
        // Using > instead of >= here since most events, when they're at the exact same time, still apply that frame.
        this.resetCooldown(spellId);
      }
    });
  }
}

export default CooldownUsable;
