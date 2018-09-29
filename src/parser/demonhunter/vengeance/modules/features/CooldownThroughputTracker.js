import SPELLS from 'common/SPELLS';
import CoreCooldownThroughputTracker, { BUILT_IN_SUMMARY_TYPES } from 'parser/core/modules/CooldownThroughputTracker';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
    {
      spell: SPELLS.METAMORPHOSIS_TANK,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
			  BUILT_IN_SUMMARY_TYPES.ABSORBED,
				BUILT_IN_SUMMARY_TYPES.HEALING,
      ],
    },
  ];
}

export default CooldownThroughputTracker;
