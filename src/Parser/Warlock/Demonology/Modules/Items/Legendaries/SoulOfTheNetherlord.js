import React from 'react';

import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

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
      result: <Wrapper>This gave you the <SpellLink id={SPELLS.GRIMOIRE_OF_SYNERGY_TALENT.id} /> talent.</Wrapper>,
    };
  }
}

export default SoulOfTheNetherlord;
