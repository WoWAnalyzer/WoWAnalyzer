import React from 'react';

import ITEMS from 'common/ITEMS';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';

/**
 * Nesingwary's Trapping Treads
 * Equip: Gain 25 Focus when one of your traps is triggered.
 */

const FOCUS_PER_PROC = 25;

class NesingwarysTrappingTreads extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  focusGain = 0;
  possibleGain = 0;
  focusWaste = 0;
  on_initialized() {
    this.active = this.combatants.selected.hasFeet(ITEMS.NESINGWARYS_TRAPPING_TREADS.id);
  }

  on_toPlayer_energize(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.NESINGWARYS_TRAPPING_TREADS_FOCUS_GAIN.id) {
      return;
    }
    this.focusGain += event.resourceChange - event.waste;
    this.focusWaste += event.waste;
    this.possibleGain += FOCUS_PER_PROC;
  }

  item() {
    return {
      item: ITEMS.NESINGWARYS_TRAPPING_TREADS,
      result: (
        <dfn data-tip={`You procced Nesingwary's Trapping Treads ${this.possibleGain / FOCUS_PER_PROC} times. <br/>You wasted ${formatNumber(this.focusWaste / this.owner.fightDuration * 60000)} focus per minute by overcapping with the proc.`}>
          You gained {formatNumber(this.focusGain / this.owner.fightDuration * 60000)} focus per minute.
        </dfn>
      ),
    };
  }
}

export default NesingwarysTrappingTreads;
