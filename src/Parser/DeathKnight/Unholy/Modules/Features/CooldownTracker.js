import CoreCooldownTracker, {BUILT_IN_SUMMARY_TYPES} from 'Parser/Core/Modules/CooldownTracker';

import SPELLS from 'common/SPELLS';

const debug = false;

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    // if im understanding correctly CooldownTracker tracks all abilities cast during the duration of some CD that buffs you in some way, (ex Battle Cry, Pillar of Frost)
    // Unholy's CDs are all based around summons so nothing goes here
  ];

  static castCooldowns = [
    {
      spell: SPELLS.DARK_ARBITER_TALENT,
      // tooltip duration is 20 seconds but with the way she works we want to capture 22 seconds
      duration: 22,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ]

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const cooldownSpell = this.constructor.castCooldowns.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (cooldownSpell) {
      // adding the fixed cooldown, now we need to remove it from activeCooldowns too
      const cooldown = this._addFixedCooldown(cooldownSpell, event.timestamp);
      this.activeCooldowns.push(cooldown);
      debug && console.log(`%cCooldown started: ${cooldownSpell.spell.name}`, 'color: green', cooldown);
    }
    // super.on_byPlayer_cast(event) would call trackEvent anyway
    super.on_byPlayer_cast && super.on_byPlayer_cast(event);
  }

  _addFixedCooldown(cooldownSpell, timestamp) {
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
    this.activeCooldowns = this.activeCooldowns.filter(cooldown => !cooldown.end || event.timestamp < cooldown.end);
    super.trackEvent(event);
  }

  on_byPlayerPet_damage(event) {
    this.trackEvent(event);
  }
}

export default CooldownTracker;
