import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';

const REGULAR_RADIANCE_COOLDOWN = 18000;
const T212SET_RADIANCE_COOLDOWN = 16000;

class Tier21_2set extends Module {

  timeSpentWithRadianceOnCD = 0;

  on_initialized() {
    this.active = this.owner.modules.combatants.selected.hasBuff(SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id);
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.POWER_WORD_RADIANCE.id) {
      return;
    }
    this.timeSpentWithRadianceOnCD += T212SET_RADIANCE_COOLDOWN;
  }

  item() {
    return {
      id: `spell-${SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id}`,
      icon: <SpellIcon id={SPELLS.POWER_WORD_RADIANCE.id} />,
      title: <SpellLink id={SPELLS.DISC_PRIEST_T21_2SET_BONUS_PASSIVE.id} />,
      result: (
        <span>
          {(this.timeSpentWithRadianceOnCD / REGULAR_RADIANCE_COOLDOWN * ((REGULAR_RADIANCE_COOLDOWN-T212SET_RADIANCE_COOLDOWN)/1000)).toFixed(1) } seconds off the Power Word: Radiance cooldown.
        </span>
      ),
    };
  }
}

export default Tier21_2set;
