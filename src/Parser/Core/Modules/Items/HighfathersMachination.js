import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import React from 'react';
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

    if (spellId === SPELLS.HIGHFATHERS_TIMEKEEPINGHEAL.id) {
      this.procUsed += 1;
      this.healing += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  on_byPlayer_applybuff(event) {
      const spellId = event.ability.guid;
      if (spellId === SPELLS.HIGHFATHERS_TIMEKEEPINGBUFF.id) {
          this.totalProc += 1;
      }
  }

  on_byPlayer_applybuffstack(event) {
      const spellId = event.ability.guid;
      if (spellId === SPELLS.HIGHFATHERS_TIMEKEEPINGBUFF.id) {
          this.totalProc += 1;
      }
  }

  item() {
    const procWasted = this.totalProc - this.procUsed;
    return {
      item: ITEMS.HIGHFATHERS_MACHINATION,
      result: (
        <dfn data-tip={`The trinket applied a total of ${this.totalProc} healing stacks.<br>${procWasted} stacks were wasted and didn't contribute to healing.`}>
        {this.owner.formatItemHealingDone(this.healing)}
        </dfn>),
    };
  }
}

export default HighfathersMachination;
