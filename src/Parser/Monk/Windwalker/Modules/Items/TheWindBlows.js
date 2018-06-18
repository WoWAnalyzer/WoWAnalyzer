import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class TheWindBlows extends Analyzer {
  static dependencies = {
    combatatants: Combatants,
  };
  freeBlackoutKicks = 0; 

  on_initialized() {
    this.active = this.combatatants.selected.hasHead(ITEMS.THE_WIND_BLOWS.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id || this.combatatants.selected.hasBuff(SPELLS.COMBO_BREAKER_BUFF.id)) {
      return;
    }
    this.freeBlackoutKicks++;
  }

  item() {
    return {
      item: ITEMS.THE_WIND_BLOWS,
      result: <React.Fragment>{this.freeBlackoutKicks} free <SpellLink id={SPELLS.COMBO_BREAKER_BUFF.id} icon />(s)</React.Fragment>,
    };
  }
}

export default TheWindBlows;
