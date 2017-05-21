import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.INCARNATION_TREE_OF_LIFE_TALENT,
  ];
}

export default CooldownTracker;
