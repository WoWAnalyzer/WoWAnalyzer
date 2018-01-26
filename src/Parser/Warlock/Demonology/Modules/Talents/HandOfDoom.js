import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import StatisticBox, { STATISTIC_ORDER } from 'Main/StatisticBox';

const DOOM_CAST_THRESHOLD = 50;

class HandOfDoom extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  hogAppliedDooms = 0;

  _lastDoomTimestamp = null;
  _alreadyPaired = true;

  on_initialized() {
    this.active = this.combatants.selected.hasTalent(SPELLS.HAND_OF_DOOM_TALENT.id);
  }

  on_byPlayer_applydebuff(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    if ((event.timestamp <= this._lastDoomTimestamp + DOOM_CAST_THRESHOLD) && !this._alreadyPaired) {
      // probably a manual cast, flag it so another ones don't get counted more than once
      this._alreadyPaired = true;
    }
    else {
      this.hogAppliedDooms += 1;
    }
  }

  on_byPlayer_refreshdebuff(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    if ((event.timestamp <= this._lastDoomTimestamp + DOOM_CAST_THRESHOLD) && !this._alreadyPaired) {
      this._alreadyPaired = true;
    }
    else {
      this.hogAppliedDooms += 1;
    }
  }

  on_byPlayer_cast(event) {
    if (event.ability.guid !== SPELLS.DOOM.id) {
      return;
    }
    this._lastDoomTimestamp = event.timestamp;
    this._alreadyPaired = false;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.HAND_OF_DOOM_TALENT.id} />}
        value={this.hogAppliedDooms}
        label="Saved GCDs"
        tooltip={`Your Hand of Gul'dan has applied or refreshed ${this.hogAppliedDooms} Dooms to the targets, saving you the global cooldowns to use on different things.`}
      />
    );
  }

  statisticOrder = STATISTIC_ORDER.OPTIONAL(2);
}

export default HandOfDoom;
