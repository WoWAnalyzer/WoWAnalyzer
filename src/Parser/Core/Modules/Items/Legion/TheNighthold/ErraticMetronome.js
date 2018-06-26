import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import { calculatePrimaryStat } from 'common/stats';

import Analyzer from 'Parser/Core/Analyzer';

/**
 * Erratic Metronome -
 * Equip: Your damaging spells have a chance to grant you 657 Haste for 12 sec, stacking up to 5 times. Stacking does not refresh duration.
 */
class ErraticMetronome extends Analyzer {
  procAmount = null;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTrinket(ITEMS.ERRATIC_METRONOME.id);
    if (this.active) {
      this.procAmount = calculatePrimaryStat(870, 657, this.selectedCombatant.getItem(ITEMS.ERRATIC_METRONOME.id).itemLevel);
    }
  }

  get averageStacks() {
    return this.selectedCombatant.getStackWeightedBuffUptime(SPELLS.ACCELERANDO.id) / this.owner.fightDuration;
  }

  get averageHaste() {
    return this.averageStacks * this.procAmount;
  }

  item() {
    return {
      item: ITEMS.ERRATIC_METRONOME,
      result: (
        <dfn data-tip={`Average Stacks: ${this.averageStacks.toFixed(2)}`}>
          {this.averageHaste.toFixed(0)} average Haste
        </dfn>
      ),
    };
  }
}

export default ErraticMetronome;
