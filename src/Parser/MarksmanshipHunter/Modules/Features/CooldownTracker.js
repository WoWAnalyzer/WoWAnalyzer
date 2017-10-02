import SPELLS from 'common/SPELLS';

import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    {
      spell: SPELLS.TRUESHOT,
      summary: [
        BUILT_IN_SUMMARY_TYPES.DAMAGE,
      ],
    },
  ];

  static ignoredSpells = [
    ...CooldownTracker.ignoredSpells,
    SPELLS.WINDBURST_MOVEMENT_SPEED.id,
  ];
}

export default CooldownTracker;
