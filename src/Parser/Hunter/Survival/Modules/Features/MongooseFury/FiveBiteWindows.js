import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox from 'Interface/Others/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'Interface/Others/STATISTIC_ORDER';

const MAX_STACKS = 5;

/**
 * Mongoose Fury increases Mongoose Bite damage by 50% for 14 sec, stacking up to 6 times.
 * Successive attacks do not increase duration.
 */

class FiveBiteWindows extends Analyzer {

  _currentStacks = 0;
  totalWindowsStarted = 0;
  fiveBiteWindows = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MONGOOSE_BITE_TALENT.id);
  }

  on_byPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this._currentStacks = 1;
    this.totalWindowsStarted++;
  }

  on_byPlayer_applybuffstack(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this._currentStacks = event.stack;
    if (this._currentStacks === MAX_STACKS) {
      this.fiveBiteWindows++;
    }
  }

  on_byPlayer_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this._currentStacks = 0;
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MONGOOSE_FURY.id} />}
        value={`${this.fiveBiteWindows}/${this.totalWindowsStarted}`}
        label="5 stack windows"
        tooltip={`You had a total of <strong>${this.fiveBiteWindows}</strong> six bite windows out of a total of <strong>${this.totalWindowsStarted}</strong> windows started`} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default FiveBiteWindows;
