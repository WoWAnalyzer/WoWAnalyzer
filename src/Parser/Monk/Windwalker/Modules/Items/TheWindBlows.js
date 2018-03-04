import React from 'react';
import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Wrapper from  'common/Wrapper';
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
    if (spellId !== SPELLS.STRIKE_OF_THE_WINDLORD.id) {
      return;
    }
    this.freeBlackoutKicks++;
  }

  item() {
    return {
      item: ITEMS.THE_WIND_BLOWS,
      result: <Wrapper>{this.freeBlackoutKicks} free <SpellLink id={SPELLS.COMBO_BREAKER_BUFF} icon/></Wrapper>,
    };
  }
}

export default TheWindBlows;
