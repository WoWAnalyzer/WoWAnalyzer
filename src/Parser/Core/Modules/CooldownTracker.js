import SPELLS from 'common/SPELLS';

import Module from 'Parser/Core/Module';

const debug = false;

export const BUILT_IN_SUMMARY_TYPES = {
  HEALING: 'HEALING',
  OVERHEALING: 'OVERHEALING',
  ABSORBS_APPLIED: 'ABSORBS_APPLIED',
  MANA: 'MANA',
  DAMAGE: 'DAMAGE',
};

class CooldownTracker extends Module {
  static cooldownSpells = [
    {
      spell: SPELLS.INNERVATE,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
    {
      spell: SPELLS.VELENS_FUTURE_SIGHT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.HEALING,
        BUILT_IN_SUMMARY_TYPES.OVERHEALING,
        BUILT_IN_SUMMARY_TYPES.MANA,
      ],
    },
  ];

  pastCooldowns = [];
  activeCooldowns = [];

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    const cooldownSpell = this.constructor.cooldownSpells.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (!cooldownSpell) {
      return;
    }
    const cooldown = this.addCooldown(cooldownSpell, event.timestamp);
    this.activeCooldowns.push(cooldown);
    debug && console.log(`%cCooldown started: ${cooldownSpell.spell.name}`, 'color: green', cooldown);
  }
  addCooldown(cooldownSpell, timestamp) {
    const cooldown = {
      ...cooldownSpell,
      start: timestamp,
      end: null,
      events: [],
    };
    this.pastCooldowns.push(cooldown);
    return cooldown;
  }
  on_toPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    const index = this.activeCooldowns.findIndex(cooldown => cooldown.spell.id === spellId);
    if (index === -1) {
      return;
    }

    const cooldown = this.activeCooldowns[index];
    cooldown.end = event.timestamp;
    this.activeCooldowns.splice(index, 1);
    debug && console.log(`%cCooldown ended: ${cooldown.spell.name}`, 'color: red', cooldown);
  }
  on_finished() {
    this.activeCooldowns.forEach((cooldown) => {
      cooldown.end = this.owner.fight.end_time;
      debug && console.log(`%cCooldown ended: ${cooldown.spell.name}`, 'color: red', cooldown);
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
