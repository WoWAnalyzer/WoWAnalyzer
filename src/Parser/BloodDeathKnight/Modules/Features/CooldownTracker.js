// import SPELLS from 'common/SPELLS';
// import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

import CoreCooldownTracker from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,

  ];
}

export default CooldownTracker;
