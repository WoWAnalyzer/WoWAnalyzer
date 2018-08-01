import CoreCooldownThroughputTracker from 'Parser/Core/Modules/CooldownThroughputTracker';

import SPELLS from 'common/SPELLS';

class CooldownThroughputTracker extends CoreCooldownThroughputTracker {
  static cooldownSpells = [
    ...CooldownThroughputTracker.cooldownSpells,
  ];

  static ignoredSpells = [
    ...CooldownThroughputTracker.ignoredSpells,
    SPELLS.REMORSELESS_WINTER_DAMAGE.id,
    SPELLS.REMORSELESS_WINTER_ENV_CAST.id,
  ];
}

export default CooldownThroughputTracker;
