import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.ASCENDANCE,
    SPELLS.STORMKEEPER,
    SPELLS.BERSERKING
  ];
}

export default CooldownTracker;
