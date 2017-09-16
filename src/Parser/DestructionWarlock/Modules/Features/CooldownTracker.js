import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

import SPELLS from 'common/SPELLS';

const debug = false;

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    {
      spell: SPELLS.SOUL_HARVEST,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  static castCooldowns = [
    {
      spell: SPELLS.HAVOC,
      duration: 10,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.SUMMON_INFERNAL_UNTALENTED,
      duration: 25,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    //now when I think of it, neither of the following will show up as a cooldown either :/
    {
      spell: SPELLS.SUMMON_DOOMGUARD_UNTALENTED,
      duration: 25,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.GRIMOIRE_IMP,
      duration: 25,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    //for the sake of completeness, typically unused
    {
      spell: SPELLS.GRIMOIRE_VOIDWALKER,
      duration: 25,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.GRIMOIRE_SUCCUBUS,
      duration: 25,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.GRIMOIRE_FELHUNTER,
      duration: 25,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const cooldownSpell = this.constructor.castCooldowns.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (cooldownSpell) {
      // adding the fixed cooldown, now we need to remove it from activeCooldowns too
      const cooldown = this.addFixedCooldown(cooldownSpell, event.timestamp);
      this.activeCooldowns.push(cooldown);
      debug && console.log(`%cCooldown started: ${cooldownSpell.spell.name}`, 'color: green', cooldown);
    }
    // super.on_byPlayer_cast(event) would call trackEvent anyway
    this.trackEvent(event);
  }

  addFixedCooldown(cooldownSpell, timestamp) {
    const cooldown = {
      ...cooldownSpell,
      start: timestamp,
      end: timestamp + cooldownSpell.duration * 1000,
      events: [],
    };
    this.pastCooldowns.push(cooldown);
    return cooldown;
  }

  // on_event() might be more accurate but it would be most likely called much more
  trackEvent(event) {
    const finishedCooldowns = this.activeCooldowns.filter(cooldown => cooldown.end && cooldown.end < event.timestamp).map((_, index) => index);
    finishedCooldowns.forEach(index => {
      debug && console.log(`%cCooldown ended: ${this.activeCooldowns[index].spell.name}`, 'color: red', this.activeCooldowns[index]);
      this.activeCooldowns.splice(index, 1);
    });
    super.trackEvent(event);
  }
}

export default CooldownTracker;
