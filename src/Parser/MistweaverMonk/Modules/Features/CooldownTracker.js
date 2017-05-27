import SPELLS from 'common/SPELLS';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    SPELLS.MANA_TEA_TALENT,
    SPELLS.INVOKE_CHIJI_TALENT,
  ];
}

export default CooldownTracker;
