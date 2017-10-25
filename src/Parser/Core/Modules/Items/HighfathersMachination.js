import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import React from 'react';
import { formatNumber } from 'common/format';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class HighfathersMachination extends Analyzer {
  static dependencies = {
      combatants: Combatants,
  };
  healing = 0;
  procUsed = 0;
  totalProc = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasTrinket(ITEMS.HIGHFATHERS_MACHINATION.id);
  }

  on_byPlayer_heal(event) {
    const spellId = event.ability.guid;

    if (spellId === SPELLS.AMANTHULS_PRESENCEHEAL.id) {
      this.procUsed++;
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_applybuff(event) {
      const spellId = event.ability.guid;
      if (spellId === SPELLS.AMANTHULS_PRESENCEBUFF.id) {
          this.totalProc++;
      }
  }

  on_byPlayer_applybuffstack(event) {
      const spellId = event.ability.guid;
      if (spellId === SPELLS.AMANTHULS_PRESENCEBUFF.id) {
          this.totalProc++;
      }
  }

  item() {
    return {
      item: ITEMS.HIGHFATHERS_MACHINATION,
      result: (
        <dfn data-tip={`The trinket applied a total of ${this.totalProc} healing stacks.<br>${this.procUsed} stacks were used to heal a total amount of ${formatNumber(this.healing)}.<br>${this.totalProc - this.procUsed} stacks wasted.`}>
        {this.owner.formatItemHealingDone(this.healing)}
        </dfn>),
    };
  }
}

export default HighfathersMachination;
