import SPELLS from 'common/SPELLS';

import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownThroughputTracker';

const debug = false;

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.METAMORPHOSIS_HAVOC_BUFF,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.CHAOS_BLADES_TALENT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  static ignoredSpells = [
    ...CooldownThroughputTracker.ignoredSpells,
    SPELLS.CHAOS_BLADES_DAMAGE_MH.id,
    SPELLS.CHAOS_BLADES_DAMAGE_OH.id,
  ];


}

export default CooldownThroughputTracker;