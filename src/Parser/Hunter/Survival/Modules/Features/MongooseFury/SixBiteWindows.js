import React from 'react';

import SPELLS from 'common/SPELLS/index';
import Analyzer from 'Parser/Core/Analyzer';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';
import STATISTIC_ORDER from 'Main/STATISTIC_ORDER';

const MAX_STACKS = 6;

class SixBiteWindows extends Analyzer {

  _currentStacks = 0;
  totalWindowsStarted = 0;
  sixBiteWindows = 0;

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
      this.sixBiteWindows++;
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
        value={`${this.sixBiteWindows}/${this.totalWindowsStarted}`}
        label="6 stack windows"
        tooltip={`You had a total of <strong>${this.sixBiteWindows}</strong> six bite windows out of a total of <strong>${this.totalWindowsStarted}</strong> windows started`} />
    );
  }
  statisticOrder = STATISTIC_ORDER.CORE(5);
}

export default SixBiteWindows;
