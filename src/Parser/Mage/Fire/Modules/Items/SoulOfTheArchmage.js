import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class SoulOfTheArchmage extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id);
    console.log(this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHMAGE.id));
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_ARCHMAGE,
      result: <span>This gave you <SpellLink id={SPELLS.FLAME_ON_TALENT.id} />.</span>,
    };
  }
}

export default SoulOfTheArchmage;
