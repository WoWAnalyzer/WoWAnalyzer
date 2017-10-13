import SPELLS from 'common/SPELLS';
import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
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

export default CooldownTracker;
