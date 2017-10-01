import SPELLS from 'common/SPELLS';

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
   * Whether the spell can be cast. This is not the opposite of `isOnCooldown`! A spell with 2 charges, 1 available and 1 on cooldown would
   */
  isAvailable(spellId) {
    // TODO: Check for stacks
    return !this._currentCooldowns[spellId];
  }
  /**
   * Whether the spell is on cooldown. If a spell has multiple charges with 1 charge on cooldown and 1 available, this will return `true`. Use `isAvailable` if you just want to know if a spell is castable.
   */
  isOnCooldown(spellId) {
    // TODO: Check for stacks
    return !!this._currentCooldowns[spellId];
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
    // consult CastEfficiency
    const ability = this._getKnownAbility(spellId);
    return ability ? (ability.getCooldown(this.haste.current, this.combatants.selected) * 1000) : undefined;
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (!this._currentCooldowns[spellId]) {
      const expectedCooldownDuration = this.getExpectedCooldownDuration(spellId);
      if (!expectedCooldownDuration) {
        debug && console.warn('Spell', event.ability.name, event.ability.guid, 'does not have a cooldown.');
        return;
      }
      this._currentCooldowns[spellId] = {
        start: event.timestamp,
        expectedEnd: event.timestamp + expectedCooldownDuration,
      };
      debug && console.log('Cooldown started:', event.ability.name, event.ability.guid);
      this.owner.triggerEvent('startcooldown', this._fabricateEvent(event));
    } else {
      // TODO: When we support charges, this should increment chargesOnCooldown (or something like that) by 1. For now it helps debugging to warn.
      console.error(`${event.ability.name} was cast while already marked as on cooldown, does this have multiple stacks?`);
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
        // TODO: If this spell has multiple charges, and more than 1 charge is on cooldown, then we should just start the full CD again
        delete this._currentCooldowns[spellId];
        debug && console.log('Cooldown ended:', event.ability.name, event.ability.guid);
        this.owner.triggerEvent('finishcooldown', this._fabricateEvent(event));
      }
    });
  }

  _fabricateEvent(originalEvent) {
    return {
      ability: originalEvent.ability,
      sourceID: originalEvent.sourceID,
      targetID: originalEvent.sourceID,
      originalEvent,
    };
  }
}

export default CooldownUsable;
