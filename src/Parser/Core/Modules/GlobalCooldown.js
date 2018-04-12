import { formatMilliseconds } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';

// import AlwaysBeCasting from './AlwaysBeCasting';
import Abilities from './Abilities';
import Haste from './Haste';
import Channeling from './Channeling';

const INVALID_GCD_CONFIG_LAG_MARGIN = 150; // not sure what this is based around, but <150 seems to catch most false positives

/**
 * This triggers a fabricated `globalcooldown` event when appropriate.
 */
class GlobalCooldown extends Analyzer {
  static dependencies = {
    // `alwaysBeCasting` is a dependency, but it also has a dependency on this class. We can't have circular dependencies so I cheat in this class by using the deprecated `this.owner.modules`. This class only needs the dependency on ABC for legacy reasons (it has the config we need), once that's fixed we can remove it completely.
    // alwaysBeCasting: AlwaysBeCasting,
    abilities: Abilities,
    haste: Haste,
    // For the `beginchannel` event among other things
    channeling: Channeling,
  };

  /** Set by `on_initialized`: contains a list of all abilities on the GCD from the Abilities config and the ABILITIES_ON_GCD static prop of this class. */
  abilitiesOnGlobalCooldown = null;
  _errors = 0;
  get errorsPerMinute() {
    const minutesElapsed = (this.owner.fightDuration / 1000) / 60;
    return this._errors / minutesElapsed;
  }
  get isAccurate() {
    return this.errorsPerMinute < 2;
  }

  on_initialized() {
    if (this.owner.modules.alwaysBeCasting.constructor.ABILITIES_ON_GCD.length > 0) {
      console.warn('Using AlwaysBeCasting\'s ABILITIES_ON_GCD property to specify which abilities are on the Global Cooldown is deprecated. You should configure the isOnGCD property of spells in the Abilities config instead.');
    }
    const abilities = [
      ...this.owner.modules.alwaysBeCasting.constructor.ABILITIES_ON_GCD,
    ];

    this.abilities.activeAbilities
      .filter(ability => ability.isOnGCD)
      .forEach(ability => {
        if (ability.spell instanceof Array) {
          ability.spell.forEach(spell => {
            abilities.push(spell.id);
          });
        } else {
          abilities.push(ability.spell.id);
        }
      });

    this.abilitiesOnGlobalCooldown = abilities;
  }

  /**
   * Returns true if this ability is on the Global Cooldown, false if not.
   * @param spellId
   * @return {bool} Whether this ability has a GCD.
   */
  isOnGlobalCooldown(spellId) {
    return this.abilitiesOnGlobalCooldown.includes(spellId);
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
    const isOnGcd = this.isOnGlobalCooldown(spellId);
    // Cancelled casts reset the GCD (only for cast-time spells, "channels" always have a GCD but they also can't be *cancelled*, just ended early)
    const isCancelled = event.trigger.isCancelled;
    if (isOnGcd && !isCancelled) {
      this.triggerGlobalCooldown(event);
    }
  }
  /**
   * `cast` events only trigger a GCD if the spell is instant and doesn't have a channeling/casting time.
   * @param event
   */
  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const isOnGcd = this.isOnGlobalCooldown(spellId);
    // This ensures we don't crash when boss abilities are registered as casts which could even happen while channeling. For example on Trilliax: http://i.imgur.com/7QAFy1q.png
    if (!isOnGcd) {
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
    this.triggerGlobalCooldown(event);
  }

  /**
   * Trigger a `globalcooldown`-event at this timestamp for the `ability` in the provided event.
   * @param event
   */
  triggerGlobalCooldown(event) {
    this.owner.fabricateEvent({
      type: 'globalcooldown',
      ability: event.ability,
      sourceID: event.sourceID,
      targetID: event.sourceID, // no guarantees the original targetID is the player
      timestamp: event.timestamp,
      duration: this.getCurrentGlobalCooldown(event.ability.guid),
    }, event);
  }
  /**
   * Returns the current Global Cooldown duration in milliseconds for the specified spell (some spells have custom GCDs).
   * @param spellId
   * @returns {number} The duration in milliseconds.
   */
  getCurrentGlobalCooldown(spellId = null) {
    return (spellId && this.owner.modules.alwaysBeCasting.constructor.STATIC_GCD_ABILITIES[spellId]) || this.constructor.calculateGlobalCooldown(this.haste.current, this.owner.modules.alwaysBeCasting.constructor.BASE_GCD, this.owner.modules.alwaysBeCasting.constructor.MINIMUM_GCD);
  }

  /** @type {object} The last GCD event that occured, can be used to check if the player is affected by the GCD. */
  lastGlobalCooldown = null;
  history = []; // TODO: Move this to SpellTimeline, it's only used for that so it should track it itself
  on_toPlayer_globalcooldown(event) {
    this.history.push(event);
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
          'errors:', this._errors
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
  static calculateGlobalCooldown(haste, baseGcd, minGcd) {
    const gcd = baseGcd / (1 + haste);
    // Global cooldowns can't normally drop below a certain threshold
    return Math.max(minGcd, gcd);
  }
}

export default GlobalCooldown;
