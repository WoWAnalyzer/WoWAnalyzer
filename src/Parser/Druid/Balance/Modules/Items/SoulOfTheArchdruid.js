import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import Wrapper from 'common/Wrapper';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

class SoulOfTheArchdruid extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.SOUL_OF_THE_ARCHDRUID.id);
  }

  item() {
    return {
      item: ITEMS.SOUL_OF_THE_ARCHDRUID,
      result: <Wrapper>This gave you <SpellLink id={SPELLS.SOUL_OF_THE_FOREST_TALENT_BALANCE.id} />.</Wrapper>,
    };
  }
}

export default SoulOfTheArchdruid;
