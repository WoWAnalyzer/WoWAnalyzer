import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

class SoulOfTheNetherlord extends Analyzer {

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_NETHERLORD,
      result: <React.Fragment>This gave you <SpellLink id={SPELLS.ERADICATION_TALENT.id} /> talent.</React.Fragment>,
    };
  }
}

export default SoulOfTheNetherlord;
