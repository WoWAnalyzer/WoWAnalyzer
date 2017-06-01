import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = true;

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
    const cooldown = {
      ability: spell,
      start: event.timestamp,
      end: null,
      events: [],
    };
    this.cooldowns.push(cooldown);
    this.activeCooldowns.push(cooldown);
    debug && console.log(`%cCooldown started: ${cooldown.ability.name}`, 'color: green', cooldown);
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
  on_byPlayer_cast(event) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
  on_byPlayer_heal(event) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
  on_byPlayer_absorbed(event) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
  on_byPlayer_damage(event) {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.events.push(event);
    });
  }
}

export default CooldownTracker;
