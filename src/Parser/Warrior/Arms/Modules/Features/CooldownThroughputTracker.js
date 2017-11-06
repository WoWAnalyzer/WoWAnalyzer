import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.BATTLE_CRY,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];
}

export default CooldownThroughputTracker;
