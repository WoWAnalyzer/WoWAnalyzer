import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.VENDETTA,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.SUBTERFUGE_BUFF,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.MASTER_ASSASIN_BUFF,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];
}

export default CooldownThroughputTracker;
