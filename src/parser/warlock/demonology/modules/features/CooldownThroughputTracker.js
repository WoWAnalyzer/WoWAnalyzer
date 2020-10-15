import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/shared/modules/CooldownThroughputTracker';

import SPELLS from 'common/SPELLS';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static castCooldowns = [
    ...CoreCooldownThroughputTracker.castCooldowns,
    {
      spell: SPELLS.NETHER_PORTAL_TALENT,
      duration: 20,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.GRIMOIRE_FELGUARD_TALENT,
      duration: 15,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
    {
      spell: SPELLS.SUMMON_DEMONIC_TYRANT,
      duration: 15,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];
}

export default CooldownThroughputTracker;
