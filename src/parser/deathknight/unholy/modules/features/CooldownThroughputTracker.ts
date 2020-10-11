import SPELLS from 'common/SPELLS';

import { DamageEvent } from 'parser/core/Events';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.UNHOLY_FRENZY_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  trackEvent(event: DamageEvent) {
    this.activeCooldowns = this.activeCooldowns.filter(cooldown => !cooldown.end || event.timestamp < cooldown.end);
    super.trackEvent(event);
  }

  on_byPlayerPet_damage(event: DamageEvent) {
    this.trackEvent(event);
  }
}

export default CooldownThroughputTracker;
