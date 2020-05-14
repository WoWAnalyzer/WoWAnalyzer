import { formatMilliseconds } from 'common/format';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import EventEmitter from 'parser/core/modules/EventEmitter';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';

import Abilities from '../../core/modules/Abilities';
import Haste from './Haste';
import Channeling from './Channeling';

const INVALID_GCD_CONFIG_LAG_MARGIN = 150; // not sure what this is based around, but <150 seems to catch most false positives
const MIN_GCD = 750; // Minimum GCD for most abilities is 750ms.

/**
 * This triggers a fabricated `globalcooldown` event when appropriate.
 */
class GlobalCooldown extends Analyzer {
  static dependencies = {
    eventEmitter: EventEmitter,
    abilities: Abilities,
    haste: Haste,
    // For the `beginchannel` event among other things
    channeling: Channeling,
  };

  _errors = 0;
  get errorsPerMinute() {
    const minutesElapsed = (this.owner.fightDuration / 1000) / 60;
    return this._errors / minutesElapsed;
  }
  get isAccurate() {
    return this.errorsPerMinute < 2;
  }

  /**
   * Returns true if this ability is on the Global Cooldown, false if not.
   * @param {number} spellId
   * @return {boolean} Whether this ability has a GCD.
   */
  isOnGlobalCooldown(spellId) {
    return !!this.getGlobalCooldownDuration(spellId);
  }

  _currentChannel = null;
  /**
   * Listening to `beginchannel` instead of `begincast` since this also includes *channeled* abilities which don't usually trigger a `begincast` event.
   * If the channel of the cast was cancelled before it was finished (in the case of cast-time abilities, not channels), the GCD event will *not* be fired since it will reset upon cancel. We have no way of knowing *when* the cancel is (regardless if it's 100ms into the channel or 1400ms), but in most cases not triggering the entire GCD is enough.
   * @param event
   */
  on_byPlayer_beginchannel(event) {
    this._currentChannel = event;

    const spellId = event.ability.guid;
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    // Cancelled casts reset the GCD (only for cast-time spells, "channels" always have a GCD but they also can't be *cancelled*, just ended early)
    const isCancelled = event.trigger.isCancelled;
    if (isOnGCD && !isCancelled) {
      event.globalCooldown = this.triggerGlobalCooldown(event);
    }
  }
  /**
   * `cast` events only trigger a GCD if the spell is instant and doesn't have a channeling/casting time.
   * @param event
   */
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const isOnGCD = this.isOnGlobalCooldown(spellId);
    if (!isOnGCD) {
      // This ensures we don't crash when boss abilities are registered as casts which could even happen while channeling. For example on Trilliax: http://i.imgur.com/7QAFy1q.png
      return;
    }
    if (CASTS_THAT_ARENT_CASTS.includes(spellId)) {
      // If it gets registered as a cast, but it's really not an actual cast (See Frenzy being "cast" when a BM Hunter casts Barbed Shot this simply returns so we don't trigger a GCD.
      return;
    }
    // We can't rely on `this.channeling` here since it will have been executed first so will already have marked the channel as ended. This is annoying since it will be more reliable and work with changes.
    const isChanneling = !!this._currentChannel;
    const isChannelingSameSpell = isChanneling && this._currentChannel.ability.guid === event.ability.guid;

    // Reset the current channel prior to returning if `isChannelingSameSpell`, since the player might cast the same ability again and the second `cast` event might be an instant (e.g. channeled Aimed Shot into proc into instant Aimed Shot).
    this._currentChannel = null;

    if (isChannelingSameSpell) {
      // The GCD occured already at the start of this channel
      return;
    }
    event.globalCooldown = this.triggerGlobalCooldown(event);
  }

  /**
   * Trigger a `globalcooldown`-event at this timestamp for the `ability` in the provided event.
   * @param event
   */
  triggerGlobalCooldown(event) {
    return this.eventEmitter.fabricateEvent({
      type: EventType.GlobalCooldown,
      ability: event.ability,
      sourceID: event.sourceID,
      targetID: event.sourceID, // no guarantees the original targetID is the player
      timestamp: event.timestamp,
      duration: this.getGlobalCooldownDuration(event.ability.guid),
    }, event);
  }

  /**
   * Returns the current Global Cooldown duration in milliseconds for the specified spell (some spells have custom GCDs).
   * Typically you should first use isOnGlobalCooldown to check if the spell is on the GCD at all. This function gives
   * a default GCD value if there's no GCD defined for the given spellId.
   * @param {number} spellId
   * @returns {number} The duration in milliseconds.
   */
  getGlobalCooldownDuration(spellId) {
    const ability = this.abilities.getAbility(spellId);
    if (!ability) {
      // Most abilities we don't know (e.g. aren't in the spellbook) also aren't on the GCD
      return 0;
    }
    const gcd = this._resolveAbilityGcdField(ability.gcd);
    if (!gcd) {
      // If gcd isn't set, null, or 0 (falsey), the spell isn't on the GCD. ps. you should set gcd to null to be explicit.
      return 0;
    }
    if (gcd.static !== undefined) {
      return this._resolveAbilityGcdField(gcd.static);
    }
    if (gcd.base) {
      const baseGCD = this._resolveAbilityGcdField(gcd.base);
      const minimumGCD = this._resolveAbilityGcdField(gcd.minimum) || MIN_GCD;
      return this.constructor.calculateGlobalCooldown(this.haste.current, baseGCD, minimumGCD);
    }
    throw new Error(`Ability ${ability.name} (spellId: ${spellId}) defines a GCD property but provides neither a base nor static value.`);
  }
  _resolveAbilityGcdField(value) {
    if (typeof value === 'function') {
      return value.call(this.owner, this.selectedCombatant);
    } else {
      return value;
    }
  }

  /** @type {object} The last GCD event that occured, can be used to check if the player is affected by the GCD. */
  lastGlobalCooldown = null;
  on_toPlayer_globalcooldown(event) {
    this._verifyAccuracy(event);
  }
  _verifyAccuracy(event) {
    if (this.lastGlobalCooldown) {
      const timeSince = event.timestamp - this.lastGlobalCooldown.timestamp;
      const remainingDuration = this.lastGlobalCooldown.duration - timeSince;
      if (remainingDuration > INVALID_GCD_CONFIG_LAG_MARGIN) {
        this._errors += 1;
        console.error(
          formatMilliseconds(this.owner.fightDuration),
          'GlobalCooldown',
          event.trigger.ability.name, event.trigger.ability.guid,
          `was cast while the Global Cooldown from`,
          this.lastGlobalCooldown.ability.name, this.lastGlobalCooldown.ability.guid,
          `was already running. There's probably a Haste buff missing from StatTracker or the Haste module, this spell has a GCD different from the default, or the base GCD for this spec is different from default.`,
          'time passed:', timeSince,
          'cooldown remaining:', remainingDuration,
          'expectedDuration:', this.lastGlobalCooldown.duration,
          'errors:', this._errors,
        );
      }
    }
    this.lastGlobalCooldown = event;
  }

  /**
   * Calculates the GCD based on the current Haste, taking into account the minimum possible GCD.
   * @param haste
   * @param baseGcd
   * @param minGcd
   * @returns {number}
   */
  static calculateGlobalCooldown(haste, baseGcd = 1500, minGcd = 750) {
    const gcd = baseGcd / (1 + haste);
    // Global cooldowns can't normally drop below a certain threshold
    return Math.max(minGcd, gcd);
  }
}

export default GlobalCooldown;
