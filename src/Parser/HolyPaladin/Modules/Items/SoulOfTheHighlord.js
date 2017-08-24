import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';

import Module from 'Parser/Core/Module';

class SoulOfTheHighlord extends Module {
  on_initialized() {
    this.active = this.owner.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HIGHLORD,
      result: <span>This gave you <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} />.</span>,
    };
  }
}

export default SoulOfTheHighlord;
