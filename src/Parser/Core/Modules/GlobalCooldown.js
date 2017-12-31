import Analyzer from 'Parser/Core/Analyzer';
// import AlwaysBeCasting from './AlwaysBeCasting';
import Abilities from './Abilities';
import Haste from './Haste';
import Channeling from './Channeling';

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

  on_initialized() {
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

  isOnGlobalCooldown(spellId) {
    return this.abilitiesOnGlobalCooldown.includes(spellId);
  }

  _currentChannel = null;
  on_byPlayer_beginchannel(event) {
    this._currentChannel = event;

    const spellId = event.ability.guid;
    const isOnGcd = this.isOnGlobalCooldown(spellId);
    // Cancelled casts reset the GCD (only for cast-time spells, "channels" always have a GCD but they also can't be *cancelled*, just ended early)
    const isCancelled = event.reason.isCancelled;
    if (isOnGcd && !isCancelled) {
      this.triggerGlobalCooldown(event, 'begincast');
    }
  }
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

    if (isChannelingSameSpell) {
      // The GCD occured already at the start of this channel
      return;
    }
    this._currentChannel = null;
    this.triggerGlobalCooldown(event, 'cast');
  }

  triggerGlobalCooldown(event, trigger) {
    this.owner.triggerEvent('globalcooldown', {
      type: 'globalcooldown',
      ability: event.ability,
      timestamp: event.timestamp,
      duration: this.getCurrentGlobalCooldown(event.ability.id),
      reason: event,
      trigger,
    });
  }
  getCurrentGlobalCooldown(spellId = null) {
    return (spellId && this.owner.modules.alwaysBeCasting.constructor.STATIC_GCD_ABILITIES[spellId]) || this.constructor.calculateGlobalCooldown(this.haste.current, this.owner.modules.alwaysBeCasting.constructor.BASE_GCD, this.owner.modules.alwaysBeCasting.constructor.MINIMUM_GCD);
  }

  // TODO: Move this to SpellTimeline, it's only used for that so it should track it itself
  history = [];
  on_globalcooldown(event) {
    this.history.push(event);
  }

  static calculateGlobalCooldown(haste, baseGcd, minGcd) {
    const gcd = baseGcd / (1 + haste);
    // Global cooldowns can't normally drop below a certain threshold
    return Math.max(minGcd, gcd);
  }
  static inRange(num1, goal, buffer) {
    return num1 > (goal - buffer) && num1 < (goal + buffer);
  }
}

export default GlobalCooldown;
