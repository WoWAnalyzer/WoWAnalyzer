import SPELLS from 'common/SPELLS';

import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

class CooldownTracker extends CoreCooldownTracker {
  static cooldownSpells = [
    ...CooldownTracker.cooldownSpells,
    // if im understanding correctly CooldownTracker tracks all abilities cast during the duration of some CD that buffs you in some way, (ex Battle Cry, Pillar of Frost)
    // Unholy's CDs are all based around summons, so its not working by following default examples
    // TODO: study demo warlock's CooldownTracker, they got it figured out
  ];
}

export default CooldownTracker;
