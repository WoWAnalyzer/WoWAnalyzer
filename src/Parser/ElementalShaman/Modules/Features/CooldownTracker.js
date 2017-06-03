import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.ASCENDANCE,
    SPELLS.STORMKEEPER
    // SPELLS.BERSERKING // Could be healing or damagin type, so skipping
  ];
}

export default CooldownTracker;
