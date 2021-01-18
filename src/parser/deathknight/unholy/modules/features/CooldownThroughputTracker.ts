import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CoreCooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.UNHOLY_BLIGHT_TALENT,
      duration: 20,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ]
    }
  ];
}

export default CooldownThroughputTracker;
