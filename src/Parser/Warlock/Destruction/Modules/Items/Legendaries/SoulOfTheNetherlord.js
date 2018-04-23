import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';

class SoulOfTheNetherlord extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_NETHERLORD.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_NETHERLORD,
      result: <React.Fragment>This gave you <SpellLink id={SPELLS.ERADICATION_TALENT.id} /> talent.</React.Fragment>,
    };
  }
}

export default SoulOfTheNetherlord;
