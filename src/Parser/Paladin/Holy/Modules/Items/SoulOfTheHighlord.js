import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class SoulOfTheHighlord extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HIGHLORD,
      result: <React.Fragment>This gave you <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} />.</React.Fragment>,
    };
  }
}

export default SoulOfTheHighlord;
