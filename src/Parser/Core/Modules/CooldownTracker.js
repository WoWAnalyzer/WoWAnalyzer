import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = false;

class CooldownTracker extends Module {
  static cooldownSpells = [
    SPELLS.INNERVATE,
    SPELLS.VELENS_FUTURE_SIGHT,
  ];

  cooldowns = [];
  activeCooldowns = [];

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const spell = this.constructor.cooldownSpells.find(spell => spell.id === spellId);
    if (!spell) {
      return;
    }
    const cooldown = this.addCooldown(spell, event.timestamp);
    this.activeCooldowns.push(cooldown);
    debug && console.log(`%cCooldown started: ${cooldown.ability.name}`, 'color: green', cooldown);
  }
  addCooldown(spell, timestamp) {
    const cooldown = {
      ability: spell,
      start: timestamp,
      end: null,
      events: [],
    };
    this.cooldowns.push(cooldown);
    return cooldown;
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    const index = this.activeCooldowns.findIndex(cooldown => cooldown.ability.id === spellId);
    if (index === -1) {
      return;
    }

    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
    debug && console.log(`%cCooldown ended: ${cooldown.ability.name}`, 'color: red', cooldown);
  }
  on_finished() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;
      debug && console.log(`%cCooldown ended: ${cooldown.ability.name}`, 'color: red', cooldown);
    });
    this.activeCooldowns = [];
  }

  // region Event tracking
  trackEvent(event) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
  on_byPlayer_cast(event) {
    this.trackEvent(event);
  }
  on_byPlayer_heal(event) {
    this.trackEvent(event);
  }
  on_byPlayer_absorbed(event) {
    this.trackEvent(event);
  }
  on_byPlayer_damage(event) {
    this.trackEvent(event);
  }
  // endregion
}

export default CooldownTracker;
