import React from 'react';
import SPELLS from 'common/SPELLS';
import ITEMS from 'common/ITEMS';
import SpellIcon from 'common/SpellIcon';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import Wrapper from 'common/Wrapper';

class OnethsIntuition extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  freeStarsurgeProcs = 0;
  freeStarfallProcs = 0;
  freeStarsurgeProcsWasted = 0;
  freeStarfallProcsWasted = 0;

  on_initialized() {
    this.active = this.combatants.selected.hasWrists(ITEMS.ONETHS_INTUITION.id);
  }

  on_toPlayer_applybuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ONETHS_INTUITION.id) {
      this.freeStarsurgeProcs += 1;
    }
    if (spellId === SPELLS.ONETHS_OVERCONFIDENCE.id) {
      this.freeStarfallProcs += 1;
    }
  }
  on_toPlayer_refreshbuff(event) {
    const spellId = event.ability.guid;
    if (spellId === SPELLS.ONETHS_INTUITION.id) {
      this.freeStarsurgeProcs += 1;
      this.freeStarsurgeProcsWasted += 1;
    }
    if (spellId === SPELLS.ONETHS_OVERCONFIDENCE.id) {
      this.freeStarfallProcs += 1;
      this.freeStarfallProcsWasted += 1;
    }
  }

  item() {
    return {
      item: ITEMS.ONETHS_INTUITION,
      result: (
        <dfn data-tip={`
          <ul>
            <li>Free Starsurge procs gained: ${this.freeStarsurgeProcs} (${this.freeStarsurgeProcsWasted} wasted)</li>
            <li>Free Starfall procs gained: ${this.freeStarfallProcs} (${this.freeStarfallProcsWasted} wasted)</li>
          </ul>
        `}>
          <Wrapper>{this.freeStarsurgeProcs} <SpellIcon id={SPELLS.ONETHS_INTUITION.id}/> {this.freeStarfallProcs} <SpellIcon id={SPELLS.ONETHS_OVERCONFIDENCE.id}/></Wrapper>
        </dfn>
      ),
    };
  }
}

export default OnethsIntuition;
