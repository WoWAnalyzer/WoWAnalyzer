import React from 'react';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

class HandOfDoom extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  _doomsApplied = 0;
  _doomsCast = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HAND_OF_DOOM_TALENT.id);
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    this._doomsApplied += 1;
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    this._doomsCast += 1;
  }

  statistic() {
    const hogAppliedDooms = this._doomsApplied - this._doomsCast;
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAND_OF_DOOM_TALENT.id} />}
        value={hogAppliedDooms}
        label="Saved GCDs"
        tooltip={`Your Hand of Gul'dan has applied ${hogAppliedDooms} Dooms to the targets, saving you the global cooldowns to use on different things.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default HandOfDoom;
