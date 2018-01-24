import React from 'react';

import ITEMS from 'common/ITEMS/index';
import SPELLS from 'common/SPELLS/index';
import { formatPercentage } from 'common/format';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import getDamageBonus from 'Parser/Hunter/Shared/Modules/getDamageBonus';
import ItemDamageDone from 'Main/ItemDamageDone';
import Wrapper from 'common/Wrapper';
import StatisticBox from 'Main/StatisticBox';
import SpellIcon from 'common/SpellIcon';

const MAX_STACKS = 6;

class SixBiteWindows extends Analyzer {

  _currentStacks = 0;
  totalWindowsStarted = 0;
  sixBiteWindows = 0;
  sixBiteWindowBites = 0;
  totalBites = 0;

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

  on_byPlater_removebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_FURY.id) {
      return;
    }
    this._currentStacks = 0;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.MONGOOSE_BITE.id) {
      return;
    }
    this.totalBites++;
    if (this._currentStacks === MAX_STACKS) {
      this.sixBiteWindowBites += 1;
    }
    this.bonusDmg += 1;
  }
  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.MONGOOSE_FURY.id} />}
        value={`${this.sixBiteWindows}/${this.totalWindowsStarted}`}
        label="6 stack/total windows"
        tooltip={`Mongoose Fury information:
        <ul>
          <li>You had a total of <strong>${this.sixBiteWindows}</strong> six bite windows out of a total of <strong>${this.totalWindowsStarted}</strong> windows started</li>
          <li>You cast an average of ${(this.sixBiteWindowBites / this.sixBiteWindows).toFixed(1)} Mongoose Bites in</li>
        </ul>`} />
    );
  }
}

export default SixBiteWindows;
