import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';
import Combatants from 'Parser/Core/Modules/Combatants';

class MKIIGyroscopicStabilizer extends Module {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasHands(ITEMS.MKII_GYROSCOPIC_STABILIZER.id);
  }

  item() {
    return {
      item: ITEMS.MKII_GYROSCOPIC_STABILIZER,
      result: <span>This allowed you to move while casting, and increased crit chance of every second <SpellLink id={SPELLS.AIMED_SHOT.id}/>.</span>,
    };
  }
}

export default MKIIGyroscopicStabilizer;
