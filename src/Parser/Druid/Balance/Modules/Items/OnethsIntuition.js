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

  item() {
    return {
      item: ITEMS.ONETHS_INTUITION,
      result: (
          <Wrapper>{this.freeStarsurgeProcs} <SpellIcon id={SPELLS.ONETHS_INTUITION.id}/> {this.freeStarfallProcs} <SpellIcon id={SPELLS.ONETHS_OVERCONFIDENCE.id}/></Wrapper>
        ),
    };
  }
}

export default OnethsIntuition;
