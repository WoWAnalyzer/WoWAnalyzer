import React from 'react';

import ITEMS from 'common/ITEMS';
import SpellLink from 'common/SpellLink';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';
import SPELLS from 'common/SPELLS';

/*
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
      result: <span>This gave your <SpellLink id={SPELLS.MARKED_SHOT.id} /> a 15 %chance to not consume <SpellLink id={SPELLS.HUNTERS_MARK.id} />.</span>,
    };
  }

}

export default ZevrimsHunger;
