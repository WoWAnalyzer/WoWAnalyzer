import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Analyzer from 'Parser/Core/Analyzer';

class SoulOfTheHighlord extends Analyzer {
  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_HIGHLORD.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_HIGHLORD,
      result: <React.Fragment>This gave you <SpellLink id={SPELLS.DIVINE_PURPOSE_TALENT_HOLY.id} />.</React.Fragment>,
    };
  }
}

export default SoulOfTheHighlord;
