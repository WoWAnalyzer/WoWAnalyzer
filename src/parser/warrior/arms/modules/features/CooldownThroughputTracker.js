import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.SWEEPING_STRIKES,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.AVATAR_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.DEADLY_CALM_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  static castCooldowns = [
    {
      spell: SPELLS.WARBREAKER_TALENT,
      duration: 10,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.COLOSSUS_SMASH,
      duration: 10,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    const cooldownSpell = this.constructor.castCooldowns.find(cooldownSpell => cooldownSpell.spell.id === spellId);
    if (cooldownSpell) {
      const cooldown = this._addFixedCooldown(cooldownSpell, event.timestamp);
      this.activeCooldowns.push(cooldown);
    }
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

  trackEvent(event) {
    this.activeCooldowns = this.activeCooldowns.filter(cooldown => !cooldown.end || event.timestamp < cooldown.end);
    super.trackEvent(event);
  }
}

export default CooldownThroughputTracker;
