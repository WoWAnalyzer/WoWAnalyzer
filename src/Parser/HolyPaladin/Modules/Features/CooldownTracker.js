import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.AVENGING_WRATH,
    SPELLS.HOLY_AVENGER_TALENT,
    SPELLS.AURA_MASTERY,
  ];
}

export default CooldownTracker;
