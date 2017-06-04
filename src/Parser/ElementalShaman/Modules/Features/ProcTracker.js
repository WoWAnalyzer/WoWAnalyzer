import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class ProcTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    SPELLS.POWER_OF_THE_MAELSTROM,
    SPELLS.ELEMENTAL_FOCUS,
    SPELLS.LAVA_SURGE
  ];
}

export default ProcTracker;
