import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';
import { ApplyDebuffEvent, CastEvent } from 'parser/core/Events';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.BESTIAL_WRATH,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.ASPECT_OF_THE_WILD,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.BLOOD_OF_THE_ENEMY,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  on_byPlayer_applydebuff(event: ApplyDebuffEvent) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BLOOD_OF_THE_ENEMY.id) {
      this.startCooldown(event);
    }
  }

  on_byPlayer_cast(event: CastEvent) {
    const spellId = event.ability.guid;
    this.trackEvent(event);
    if (spellId === SPELLS.BLOOD_OF_THE_ENEMY.id) {
      this.startCooldown(event);
    }
  }
}

export default CooldownThroughputTracker;
