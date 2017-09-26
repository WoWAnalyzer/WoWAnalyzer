import SPELLS from 'common/SPELLS';

import CoreCooldownTracker, { BUILT_IN_SUMMARY_TYPES } from 'Parser/Core/Modules/CooldownTracker';

const debug = false;

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

  castEventSpells = [
    SPELLS.WINDBURST_MOVEMENT_SPEED.id,
  ];

  on_byPlayer_cast(event) {
    const spellID = event.ability.guid;
    if (this.castEventSpells.indexOf(spellID) !== -1)  {
      debug && console.log('Exiting');
      return;
    }
    super.on_byPlayer_cast(event);
  }
}

export default CooldownTracker;
