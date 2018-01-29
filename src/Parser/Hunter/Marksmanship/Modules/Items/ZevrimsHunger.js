import React from 'react';

import ITEMS from 'common/ITEMS';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import Wrapper from 'common/Wrapper';
import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

/**
 * Zevrim's Hunger
 * Equip: Marked Shot has a 15% chance to not remove Hunter's Mark.
 */
class ZevrimsHunger extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };

  on_initialized() {
    this.active = this.combatants.selected.hasFinger(ITEMS.ZEVRIMS_HUNGER.id);
  }

  item() {
    return {
      item: ITEMS.ZEVRIMS_HUNGER,
      result: (
        <Wrapper>
          This gave your <SpellLink id={SPELLS.MARKED_SHOT.id} icon /> a 15% chance to not consume <SpellLink id={SPELLS.HUNTERS_MARK.id} />.
        </Wrapper>
      ),
    };
  }
}

export default ZevrimsHunger;
